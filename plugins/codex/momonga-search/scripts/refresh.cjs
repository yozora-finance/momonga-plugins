// Updates this plugin from its GitHub marketplace and proves the runtime sees the required skill.
// Standalone: the update replaces the versioned cache directory containing this file.
// Usage: node refresh.cjs CODEX_BINARY REQUIRED_REVISION COMMAND_ID
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const readline = require('node:readline');

const MARKETPLACE = 'momonga';
const PLUGIN_ID = 'momonga-search@momonga';
// One budget for the whole update, below the 180 seconds the skill waits for this helper.
const BUDGET = 150000;

function parseArgs([binary, requiredText, command]) {
  if (!binary || !/^[1-9]\d*$/.test(requiredText || '') || !Number.isSafeInteger(Number(requiredText)) || !command)
    throw new Error('Expected desktop binary, positive required revision, and command ID');
  return { binary, required: Number(requiredText), command };
}

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

// Asks a fresh app-server which skill file is active after a forced reload; files on disk alone are not proof.
function activeSkills(binary, env, cwd, deadline) {
  const child = launch(binary, ['app-server', '--listen', 'stdio://'], { env, cwd });
  return supervise(child, deadline, 'waiting for skills/list', () => new Promise((resolve, reject) => {
    child.stdin.on('error', reject);
    child.exited.then(code => reject(code instanceof Error ? code : new Error('App-server exited before listing skills')));
    const send = message => child.stdin.write(JSON.stringify(message) + '\n');
    readline.createInterface({ input: child.stdout }).on('line', line => {
      let message;
      try { message = JSON.parse(line); } catch { return reject(new Error('Invalid app-server response')); }
      if (message.id === 1) {
        if (message.error) return reject(new Error('App-server rejected initialize'));
        send({ method: 'initialized', params: {} });
        send({ id: 2, method: 'skills/list', params: { cwds: [cwd], forceReload: true } });
      } else if (message.id === 2) {
        if (message.error || !Array.isArray(message.result?.data))
          return reject(new Error('Unsupported skills/list response; update the desktop app'));
        resolve(message.result.data.flatMap(group => group.skills || []));
      }
    });
    send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'momonga-skill-refresh', version: '2' } } });
  }));
}

// The Git ref and commit the marketplace snapshot is checked out at, as cloned by the Codex CLI.
function snapshot(root) {
  const git = path.join(root, '.git');
  const head = fs.readFileSync(path.join(git, 'HEAD'), 'utf8').trim();
  if (!head.startsWith('ref: ')) return { ref: head, commit: head };
  const name = head.slice(5);
  const loose = path.join(git, name);
  const commit = fs.existsSync(loose) ? fs.readFileSync(loose, 'utf8').trim()
    : fs.readFileSync(path.join(git, 'packed-refs'), 'utf8').split('\n').find(line => line.endsWith(' ' + name))?.split(' ')[0];
  if (!/^[0-9a-f]{40}$/.test(commit || '')) throw new Error('Cannot read the marketplace commit of ' + name);
  return { ref: name.replace(/^refs\/heads\//, ''), commit };
}

async function refresh({ binary, required, command }, { home, scriptRoot, budget = BUDGET }) {
  const release = JSON.parse(fs.readFileSync(path.join(scriptRoot, 'release.json'), 'utf8'));
  if (!Object.hasOwn(release.commands, command)) throw new Error('Unknown command: ' + command);
  const cache = path.join(home, 'plugins/cache', MARKETPLACE, 'momonga-search');
  if (path.dirname(scriptRoot) !== cache) throw new Error('Run the helper of the installed Momonga plugin');
  const env = { ...process.env, CODEX_HOME: home, RUST_LOG: 'error' };
  const deadline = Date.now() + budget;

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
  const { ref, commit } = snapshot(market.root);
  const at = `${ref} @ ${commit.slice(0, 12)}`;
  if (!Number.isSafeInteger(latest.revision) || latest.revision < required)
    throw new Error(`GitHub (${at}) has skill revision ${latest.revision}, older than the required ${required}; the release is not published on this ref yet`);
  if (!/^\d+\.\d+\.\d+$/.test(latest.version)) throw new Error('Invalid release version');
  const installed = path.join(cache, latest.version);
  if (!fs.existsSync(installed) || !sameRelease(source, installed))
    throw new Error(`Version ${latest.version} was fetched but is not installed in the plugin cache; check that Momonga is installed and enabled`);

  const relative = latest.commands[command];
  if (typeof relative !== 'string' || !relative.startsWith('skills/') || relative.includes('..')) throw new Error('Invalid command path');
  const skillPath = path.join(installed, relative);
  const state = path.join(home, '.tmp/momonga-skill-refresh');
  fs.mkdirSync(state, { recursive: true });
  const active = (await activeSkills(binary, env, state, deadline)).filter(skill =>
    skill.pluginId === PLUGIN_ID && skill.enabled !== false && fs.existsSync(skill.path) && fs.realpathSync(skill.path) === fs.realpathSync(skillPath));
  if (active.length !== 1) throw new Error('The runtime does not list the updated skill ' + skillPath);
  return { revision: latest.revision, version: latest.version, marketplace_ref: ref, commit, skill_path: skillPath };
}

module.exports = { refresh };

if (require.main === module) {
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'])
    process.once(signal, () => { stopAllNow(); process.exit(128 + os.constants.signals[signal]); });
  Promise.resolve()
    .then(() => refresh(parseArgs(process.argv.slice(2)), {
      home: fs.realpathSync(process.env.CODEX_HOME || path.join(os.homedir(), '.codex')),
      scriptRoot: fs.realpathSync(path.resolve(__dirname, '..')),
    }))
    .then(result => process.stdout.write(JSON.stringify(result) + '\n'))
    .catch(error => { process.stderr.write('Momonga update failed: ' + error.message + '\n'); process.exitCode = 1; });
}
