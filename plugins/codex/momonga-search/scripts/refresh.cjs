// Updates this plugin from its GitHub marketplace and proves the runtime sees the required skill.
// Standalone: the update replaces the versioned cache directory containing this file.
// Usage: node refresh.cjs CODEX_BINARY REQUIRED_REVISION COMMAND_ID
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const readline = require('node:readline');

const MARKETPLACE = 'momonga';
const PLUGIN_ID = 'momonga-search@momonga';
const TIMEOUT = 120000;

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

function cli(binary, env, args) {
  return JSON.parse(execFileSync(binary, [...args, '--json'], { env, encoding: 'utf8', timeout: TIMEOUT, maxBuffer: 4 * 1024 * 1024 }));
}

// Asks a fresh app-server which skill file is active after a forced reload; files on disk alone are not proof.
function activeSkills(binary, env, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['app-server', '--listen', 'stdio://'], { env, cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let diagnostics = '', done = false;
    const finish = (error, value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.stdin.end();
      child.kill('SIGTERM');
      if (error) { if (diagnostics) error.message += '\nRuntime: ' + diagnostics.trim(); reject(error); }
      else resolve(value);
    };
    const timer = setTimeout(() => finish(new Error('Timed out waiting for skills/list')), TIMEOUT);
    child.stderr.on('data', data => { diagnostics = (diagnostics + data).slice(-4096); });
    child.on('error', finish);
    child.stdin.on('error', finish);
    child.on('exit', () => finish(new Error('App-server exited before listing skills')));
    const send = message => child.stdin.write(JSON.stringify(message) + '\n');
    readline.createInterface({ input: child.stdout }).on('line', line => {
      let message;
      try { message = JSON.parse(line); } catch { return finish(new Error('Invalid app-server response')); }
      if (message.id === 1) {
        if (message.error) return finish(new Error('App-server rejected initialize'));
        send({ method: 'initialized', params: {} });
        send({ id: 2, method: 'skills/list', params: { cwds: [cwd], forceReload: true } });
      } else if (message.id === 2) {
        if (message.error || !Array.isArray(message.result?.data))
          return finish(new Error('Unsupported skills/list response; update the desktop app'));
        finish(null, message.result.data.flatMap(group => group.skills || []));
      }
    });
    send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'momonga-skill-refresh', version: '2' } } });
  });
}

async function refresh({ binary, required, command }, { home, scriptRoot }) {
  const release = JSON.parse(fs.readFileSync(path.join(scriptRoot, 'release.json'), 'utf8'));
  if (!Object.hasOwn(release.commands, command)) throw new Error('Unknown command: ' + command);
  const cache = path.join(home, 'plugins/cache', MARKETPLACE, 'momonga-search');
  if (path.dirname(scriptRoot) !== cache) throw new Error('Run the helper of the installed Momonga plugin');
  const env = { ...process.env, CODEX_HOME: home, RUST_LOG: 'error' };

  const market = cli(binary, env, ['plugin', 'marketplace', 'list']).marketplaces.find(entry => entry.name === MARKETPLACE);
  if (market?.marketplaceSource?.sourceType !== 'git' || normalize(market.marketplaceSource.source) !== release.repository)
    throw new Error('The momonga marketplace is not the GitHub repository ' + release.repository);
  // Upgrades only this marketplace: fetches GitHub and refreshes its installed plugins' cache.
  const upgrade = cli(binary, env, ['plugin', 'marketplace', 'upgrade', MARKETPLACE]);
  if (upgrade.errors.length) throw new Error('Marketplace upgrade failed: ' + JSON.stringify(upgrade.errors));

  const source = path.join(market.root, release.sourceRoot);
  const latest = JSON.parse(fs.readFileSync(path.join(source, 'release.json'), 'utf8'));
  if (!Number.isSafeInteger(latest.revision) || latest.revision < required)
    throw new Error(`GitHub has skill revision ${latest.revision}, older than the required ${required}; the release is not published yet`);
  if (!/^\d+\.\d+\.\d+$/.test(latest.version)) throw new Error('Invalid release version');
  const installed = path.join(cache, latest.version);
  if (!fs.existsSync(installed) || !sameRelease(source, installed))
    throw new Error(`Version ${latest.version} was fetched but is not installed in the plugin cache; check that Momonga is installed and enabled`);

  const relative = latest.commands[command];
  if (typeof relative !== 'string' || !relative.startsWith('skills/') || relative.includes('..')) throw new Error('Invalid command path');
  const skillPath = path.join(installed, relative);
  const state = path.join(home, '.tmp/momonga-skill-refresh');
  fs.mkdirSync(state, { recursive: true });
  const active = (await activeSkills(binary, env, state)).filter(skill =>
    skill.pluginId === PLUGIN_ID && skill.enabled !== false && fs.existsSync(skill.path) && fs.realpathSync(skill.path) === fs.realpathSync(skillPath));
  if (active.length !== 1) throw new Error('The runtime does not list the updated skill ' + skillPath);
  return { revision: latest.revision, version: latest.version, skill_path: skillPath };
}

module.exports = { refresh };

if (require.main === module) {
  const home = fs.realpathSync(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'));
  Promise.resolve()
    .then(() => refresh(parseArgs(process.argv.slice(2)), { home, scriptRoot: fs.realpathSync(path.resolve(__dirname, '..')) }))
    .then(result => process.stdout.write(JSON.stringify(result) + '\n'))
    .catch(error => { process.stderr.write('Momonga update failed: ' + error.message + '\n'); process.exitCode = 1; });
}
