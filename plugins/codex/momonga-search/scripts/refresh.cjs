// Checks daily; personal installations always return the requested analysis instructions.
// Standalone: the update replaces the versioned cache directory containing this file.
// Usage: node refresh.cjs CODEX_BINARY COMMAND_ID. Workspace installs are a no-op.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const MARKETPLACE = 'momonga';
const MANAGED_MARKETPLACES = new Set([
  'workspace-directory', 'workspace-shared-with-me', 'workspace-shared-with-me-private',
  'workspace-shared-with-me-unlisted', 'created-by-me-remote', 'openai-curated-remote',
]);
// One budget covers the update CLI operations.
const BUDGET = 150000;
const DAY = 24 * 60 * 60 * 1000;

const normalize = url => url.replace(/\.git\/?$/, '').replace(/\/$/, '');

function files(root) {
  const found = new Map();
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) found.set(path.relative(root, full), fs.readFileSync(full));
      else throw new Error('Unsupported file in release: ' + full);
    }
  };
  walk(root);
  return found;
}

// The installed cache must be byte-identical to the upgraded GitHub snapshot of the plugin.
function sameRelease(source, installed) {
  const want = files(source), have = files(installed);
  if (want.size !== have.size) return false;
  for (const [name, body] of want) if (!have.get(name)?.equals(body)) return false;
  return true;
}

function remaining(deadline) {
  const left = deadline - Date.now();
  if (left <= 0) throw new Error('Timed out updating Momonga');
  return left;
}

// Every child leads its own process group, so stopping it also stops what it started (git, the runtime).
const children = new Set();
const groupAlive = child => { try { process.kill(-child.pid, 0); return true; } catch { return false; } };
const signalGroup = (child, signal) => { try { process.kill(-child.pid, signal); } catch {} };

function launch(binary, args, { env, cwd }) {
  const child = spawn(binary, args, { env, cwd, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
  // 'close' comes after the exit and after stdout has been fully read.
  child.exited = new Promise(resolve => { child.once('close', resolve); child.once('error', resolve); });
  child.stderrTail = '';
  child.stderr.on('data', data => { child.stderrTail = (child.stderrTail + data).slice(-4096); });
  if (child.pid !== undefined) children.add(child);
  return child;
}

// Resolves once the child and everything in its process group have stopped.
async function stop(child) {
  child.stdin.destroy();
  for (const signal of ['SIGTERM', 'SIGKILL']) {
    if (child.pid === undefined || !groupAlive(child)) break;
    signalGroup(child, signal);
    for (const end = Date.now() + 2000; groupAlive(child) && Date.now() < end;)
      await new Promise(resolve => setTimeout(resolve, 50));
  }
  children.delete(child);
  if (child.pid !== undefined && groupAlive(child)) throw new Error(`${path.basename(child.spawnfile)} did not stop`);
}

// For an interrupted helper: no child may outlive it.
function stopAllNow() {
  for (const child of children) signalGroup(child, 'SIGKILL');
}

// Runs one child under the shared deadline; it and its group have stopped before this settles.
async function supervise(child, deadline, label, work) {
  let timer;
  try {
    return await Promise.race([
      work(child),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Timed out ' + label)), remaining(deadline)); }),
    ]);
  } catch (error) {
    if (child.stderrTail.trim()) error.message += '\nRuntime: ' + child.stderrTail.trim();
    throw error;
  } finally {
    clearTimeout(timer);
    await stop(child);
  }
}

function cli(binary, env, deadline, args) {
  const label = 'running codex ' + args.join(' ');
  return supervise(launch(binary, [...args, '--json'], { env }), deadline, label, child => new Promise((resolve, reject) => {
    let stdout = '';
    child.stdout.on('data', data => {
      stdout += data;
      if (stdout.length > 4 * 1024 * 1024) reject(new Error('Output too large from codex ' + args.join(' ')));
    });
    child.stdin.end();
    child.exited.then(code => {
      if (code instanceof Error) return reject(code);
      if (code !== 0) return reject(new Error(`codex ${args.join(' ')} failed with exit code ${code}`));
      try { resolve(JSON.parse(stdout)); } catch { reject(new Error('Invalid JSON from codex ' + args.join(' '))); }
    });
  }));
}

function instructions(root, release, command) {
  const relative = release.commands[command];
  if (typeof relative !== 'string' || !relative.startsWith('skills/') || relative.includes('..')) throw new Error('Invalid command path');
  const body = fs.readFileSync(path.join(root, relative), 'utf8');
  const start = '<!-- momonga-refresh -->\n', end = '<!-- /momonga-refresh -->\n\n';
  const begin = body.indexOf(start), finish = body.indexOf(end);
  if (body.split(start).length !== 2 || body.split(end).length !== 2 || finish < begin)
    throw new Error('Invalid refresh markers in ' + relative);
  return body.slice(0, begin) + body.slice(finish + end.length);
}

function localInstructions(cache, release, command) {
  const roots = fs.readdirSync(cache, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(cache, entry.name, 'release.json')))
    .map(entry => path.join(cache, entry.name));
  if (roots.length !== 1) throw new Error('Expected exactly one installed Momonga release');
  const current = JSON.parse(fs.readFileSync(path.join(roots[0], 'release.json'), 'utf8'));
  if (current.repository !== release.repository || current.sourceRoot !== release.sourceRoot)
    throw new Error('The installed release identity changed');
  return instructions(roots[0], current, command);
}

function recent(success, release) {
  const age = success ? Date.now() - success.checked_at : DAY;
  return success && success.repository === release.repository && success.source_root === release.sourceRoot &&
    age >= 0 && age < DAY;
}

function lastSuccess(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='refresh_success'").get();
  return table ? db.prepare('SELECT repository, source_root, checked_at FROM refresh_success WHERE id=1').get() : undefined;
}

function readSuccess(file, deadline) {
  if (!fs.existsSync(file)) return undefined;
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(file, { readOnly: true, timeout: remaining(deadline) });
  try { return lastSuccess(db); }
  catch (error) {
    // SQLITE_READONLY_ROLLBACK: a killed writer left a hot rollback journal.
    // Reopen through the normal writable transaction so SQLite can recover it.
    if (error.code === 'ERR_SQLITE_ERROR' && error.errcode === 776) return undefined;
    throw error;
  } finally { db.close(); }
}

async function refresh({ binary, command }, { home, scriptRoot, budget = BUDGET }) {
  if (!/^[a-z][a-z-]*$/.test(command)) throw new Error('Invalid command ID');
  const pluginCache = path.dirname(scriptRoot), marketCache = path.dirname(pluginCache), cacheRoot = path.dirname(marketCache);
  if (path.basename(pluginCache) === 'momonga-search' && path.basename(cacheRoot) === 'cache' &&
      path.basename(path.dirname(cacheRoot)) === 'plugins' && MANAGED_MARKETPLACES.has(path.basename(marketCache)))
    return '';
  home = fs.realpathSync(home);
  const release = JSON.parse(fs.readFileSync(path.join(scriptRoot, 'release.json'), 'utf8'));
  if (!Object.hasOwn(release.commands, command)) throw new Error('Unknown command: ' + command);
  const cache = path.join(home, 'plugins/cache', MARKETPLACE, 'momonga-search');
  if (path.dirname(scriptRoot) !== cache) throw new Error('Run the helper of the installed Momonga plugin');
  const env = { ...process.env, CODEX_HOME: home, RUST_LOG: 'error' };
  const deadline = Date.now() + budget;

  // The memo and its transaction lock survive replacement of a versioned cache directory.
  const memo = path.join(home, 'plugins/data/momonga-search-momonga/refresh.sqlite');
  if (recent(readSuccess(memo, deadline), release)) return localInstructions(cache, release, command);

  fs.mkdirSync(path.dirname(memo), { recursive: true });
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(memo, { timeout: remaining(deadline) });
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS refresh_success (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      repository TEXT NOT NULL, source_root TEXT NOT NULL, checked_at INTEGER NOT NULL
    )`);
    // SQLite releases the lock on exit/crash. Recheck after waiting for another updater.
    db.exec('BEGIN IMMEDIATE');
    if (recent(lastSuccess(db), release)) {
      const body = localInstructions(cache, release, command);
      db.exec('COMMIT');
      return body;
    }
    const market = (await cli(binary, env, deadline, ['plugin', 'marketplace', 'list'])).marketplaces.find(entry => entry.name === MARKETPLACE);
    if (market?.marketplaceSource?.sourceType !== 'git' || normalize(market.marketplaceSource.source) !== release.repository)
      throw new Error('The momonga marketplace is not the GitHub repository ' + release.repository);
    // Upgrades only this marketplace: fetches GitHub and refreshes its installed plugins' cache.
    const upgrade = await cli(binary, env, deadline, ['plugin', 'marketplace', 'upgrade', MARKETPLACE]);
    if (upgrade.errors.length) throw new Error('Marketplace upgrade failed: ' + JSON.stringify(upgrade.errors));

    const source = path.join(market.root, release.sourceRoot);
    const latest = JSON.parse(fs.readFileSync(path.join(source, 'release.json'), 'utf8'));
    if (latest.repository !== release.repository || latest.sourceRoot !== release.sourceRoot)
      throw new Error('The fetched release metadata does not match the installed plugin');
    if (!/^\d+\.\d+\.\d+$/.test(latest.version)) throw new Error('Invalid release version');
    const installed = path.join(cache, latest.version);
    if (!fs.existsSync(installed) || !sameRelease(source, installed))
      throw new Error(`Version ${latest.version} was fetched but is not installed in the plugin cache; check that Momonga is installed and enabled`);

    const body = instructions(installed, latest, command);
    db.prepare('INSERT OR REPLACE INTO refresh_success (id, repository, source_root, checked_at) VALUES (1, ?, ?, ?)')
      .run(release.repository, release.sourceRoot, Date.now());
    db.exec('COMMIT');
    return body;
  } finally {
    // Closing an uncommitted transaction rolls it back: failures never advance the memo.
    db.close();
  }

}

module.exports = { refresh };

if (require.main === module) {
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'])
    process.once(signal, () => { stopAllNow(); process.exit(128 + os.constants.signals[signal]); });
  Promise.resolve()
    .then(() => {
      const [binary, command, ...extra] = process.argv.slice(2);
      if (!binary || !command || extra.length) throw new Error('Expected CODEX_BINARY COMMAND_ID');
      return refresh({ binary, command }, {
        home: process.env.CODEX_HOME || path.join(os.homedir(), '.codex'),
        scriptRoot: fs.realpathSync(path.resolve(__dirname, '..')),
      });
    })
    .then(instructions => process.stdout.write(instructions))
    .catch(error => { process.stderr.write('Momonga update failed: ' + error.message + '\n'); process.exitCode = 1; });
}
