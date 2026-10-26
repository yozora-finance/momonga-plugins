// Standalone: a refresh can delete the versioned directory containing this file.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFileSync } = require('node:child_process');
const readline = require('node:readline');
const { setTimeout: delay } = require('node:timers/promises');

async function main() {
  const [binary, requiredText, command] = process.argv.slice(2);
  const required = Number(requiredText);
  if (!binary || !/^\d+$/.test(requiredText || '') || !Number.isSafeInteger(required) || required < 1)
    throw new Error('Expected desktop binary, positive required revision, and command ID');
  const initialRoot = fs.realpathSync(path.resolve(__dirname, '..'));
  const release = JSON.parse(fs.readFileSync(path.join(initialRoot, 'release.json'), 'utf8'));
  if (!Object.hasOwn(release.commands, command)) throw new Error('Unknown command');
  const home = fs.realpathSync(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'));
  const cache = path.join(home, 'plugins/cache/momonga/momonga-search');
  if (path.dirname(initialRoot) !== cache) throw new Error('Run the installed momonga plugin helper');
  const snapshot = path.join(home, '.tmp/marketplaces/momonga');
  const source = JSON.parse(fs.readFileSync(path.join(snapshot, '.codex-marketplace-install.json'), 'utf8'));
  if (source.source_type !== 'git' || source.source.replace(/\.git\/?$/, '').replace(/\/$/, '') !== release.repository || source.ref_name !== 'main')
    throw new Error('Expected the configured Momonga Git marketplace on main');
  const state = path.join(home, '.tmp/momonga-skill-refresh');
  fs.mkdirSync(state, { recursive: true });
  const lock = path.join(state, 'lock');
  // Kernel-owned lock: no stale PID files after interruption or SIGKILL.
  const locker = spawn('/usr/bin/lockf', ['-k', '-t', '45', lock, process.execPath, '-e',
    'process.stdout.write("locked\\n");process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'],
    { cwd: state, stdio: ['pipe', 'pipe', 'pipe'], detached: true });
  locker.stderr.resume();
  locker.stdin.on('error', () => {});
  let child, reader, primaryError, success;
  let cancelled, lockAcquired = false;
  const terminate = () => {
    cancelled = new Error('Update interrupted; use the plugin settings to update manually');
    if (child?.pid) { try { process.kill(-child.pid, 'SIGTERM'); } catch {} }
    if (!lockAcquired) {
      locker.stdin.end();
      if (locker.pid) { try { process.kill(-locker.pid, 'SIGTERM'); } catch {} }
    }
  };
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, terminate);
  await new Promise((resolve, reject) => {
    locker.once('error', reject);
    locker.once('exit', () => reject(new Error('Could not acquire update lock')));
    locker.stdout.once('data', data => data.toString() === 'locked\n' ? resolve() : reject(new Error('Invalid lock response')));
  });
  lockAcquired = true;
  const deadline = Date.now() + 45000;
  let diagnostics = '', lastTransient;
  const pending = new Map();
  let sequence = 0;
  let protocolError;
  const git = (...args) => execFileSync('git', ['-C', snapshot, ...args], { encoding: 'utf8', timeout: 5000, maxBuffer: 4 * 1024 * 1024 });
  // Verify every installed file against one source commit, not a pre-fetch remote SHA.
  function installed(skills) {
    const commit = git('rev-parse', 'HEAD').trim();
    const current = JSON.parse(git('show', commit + ':' + release.sourceRoot + '/release.json'));
    if (!Number.isSafeInteger(current.revision) || current.revision < required) return null;
    if (current.repository !== release.repository || current.sourceRoot !== release.sourceRoot)
      throw new Error('Unexpected release identity');
    if (!/^\d+\.\d+\.\d+$/.test(current.version)) throw new Error('Invalid release version');
    const root = path.join(cache, current.version);
    const relative = current.commands[command];
    if (typeof relative !== 'string' || !relative.startsWith('skills/') || relative.includes('..'))
      throw new Error('Invalid command path');
    const expectedPath = path.join(root, relative);
    const matching = skills.filter(skill => {
      try { return fs.realpathSync(skill.path) === fs.realpathSync(expectedPath); }
      catch (error) { if (error.code === 'ENOENT') return false; throw error; }
    });
    if (matching.length > 1) throw new Error('Duplicate active skill');
    if (matching.length !== 1) return null;
    const listing = git('ls-tree', '-r', '-z', commit, '--', release.sourceRoot).split('\0').filter(Boolean);
    if (!listing.length) throw new Error('Empty source release');
    for (const line of listing) {
      const match = /^(\d+) blob ([a-f0-9]+)\t(.+)$/.exec(line);
      if (!match || !['100644', '100755'].includes(match[1])) throw new Error('Unsupported release file');
      const name = match[3].slice(release.sourceRoot.length + 1);
      const target = path.join(root, name);
      try {
        if (!fs.lstatSync(target).isFile()) return null;
        if (execFileSync('git', ['hash-object', '--no-filters', '--', target], { cwd: state, encoding: 'utf8', timeout: 5000 }).trim() !== match[2]) return null;
      } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    }
    if (git('rev-parse', 'HEAD').trim() !== commit) return null;
    return { revision: current.revision, skill_path: expectedPath, commit };
  }
  try {
    if (cancelled) throw cancelled;
    // Always ask the runtime which skill is active; on-disk files alone do not establish success.
    child = spawn(binary, ['-c', 'features.code_mode_host=true', 'app-server', '--listen', 'stdio://'], {
      env: { ...process.env, CODEX_HOME: home, RUST_LOG: 'error' }, cwd: state,
      stdio: ['pipe', 'pipe', 'pipe'], detached: true,
    });
    child.stderr.on('data', data => { diagnostics = (diagnostics + data.toString()).slice(-4096); });
    const abort = error => {
      protocolError = error;
      for (const request of pending.values()) request.reject(error);
      pending.clear();
    };
    child.on('error', abort);
    child.stdin.on('error', abort);
    child.on('exit', () => abort(new Error('Updater app-server exited before completion')));
    reader = readline.createInterface({ input: child.stdout });
    reader.on('line', line => {
      if (line.length > 4 * 1024 * 1024) return abort(new Error('Oversized runtime response'));
      let message;
      try { message = JSON.parse(line); } catch { return abort(new Error('Invalid runtime response')); }
      if (message.method) return;
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error('Runtime rejected ' + request.method));
      else request.resolve(message.result);
    });
    const rpc = (method, params) => new Promise((resolve, reject) => {
      if (protocolError) return reject(protocolError);
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Timed out: ' + method)); }, Math.max(1, deadline - Date.now()));
      pending.set(id, { method, resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
      child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
    });
    await rpc('initialize', { clientInfo: { name: 'momonga-skill-refresh', version: '1' }, capabilities: { experimentalApi: true } });
    child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');
    while (Date.now() < deadline) {
      if (cancelled) throw cancelled;
      let result;
      try { result = await rpc('skills/list', { cwds: [state], forceReload: true }); }
      catch (error) {
        if (protocolError || !error.message.startsWith('Runtime rejected')) throw error;
        lastTransient = error.message; await delay(250); continue;
      }
      if (!Array.isArray(result?.data)) throw new Error('Unsupported skills/list response; update desktop app');
      const skills = result.data.flatMap(group => group.skills || []).filter(skill => skill.pluginId === 'momonga-search@momonga' && skill.enabled !== false);
      let verified;
      try { verified = installed(skills); }
      catch (error) {
        // Only subprocess/file disappearance during atomic replacement is transient.
        // Validation, identity mismatches and malformed JSON remain hard failures.
        if (error.code === 'ENOENT' || (typeof error.status === 'number' && error.status !== 0)) lastTransient = error.message;
        else throw error;
      }
      if (verified) { success = verified; break; }
      await delay(250);
    }
    if (!success) throw new Error('Required release is not installed. Update Momonga manually in the plugin settings; do not continue using the old skill.' + (lastTransient ? ' Last check: ' + lastTransient : ''));
  } catch (error) { primaryError = error; if (diagnostics) error.message += '\nRuntime: ' + diagnostics; throw error; }
  finally {
    let cleanupError;
    if (child?.pid) {
      child.stdin.end();
      for (let i = 0; i < 20 && child.exitCode === null && child.signalCode === null; i++) await delay(100);
      if (child.exitCode === null && child.signalCode === null) {
        try { process.kill(-child.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') cleanupError = error; }
        await delay(300);
        if (child.exitCode === null && child.signalCode === null) {
          try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') cleanupError = error; }
        }
      }
    }
    if (child?.pid && child.exitCode === null && child.signalCode === null) {
      await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(2000)]);
      if (child.exitCode === null && child.signalCode === null) cleanupError = new Error('Updater process did not stop');
    }
    reader?.close();
    locker.stdin.end();
    await new Promise(resolve => { if (locker.exitCode !== null || locker.signalCode !== null) resolve(); else locker.once('exit', resolve); });
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.removeListener(signal, terminate);
    if (cleanupError && !primaryError) throw cleanupError;
  }
  if (cancelled) throw cancelled;
  process.stdout.write(JSON.stringify(success) + '\n');
}
main().catch(error => { process.stderr.write('Momonga update failed: ' + error.message + '\n'); process.exitCode = 1; });
