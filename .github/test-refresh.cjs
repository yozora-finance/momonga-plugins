// Contract tests for the Codex skill update helper. The Codex CLI is an external process, so a stand-in
// executable plays the marketplace (GitHub snapshot), its upgrade, and the app-server skill listing.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = 'plugins/codex/momonga-search';
const HELPER = path.join(ROOT, SOURCE_ROOT, 'scripts/refresh.cjs');
const COMMIT = '0123456789abcdef0123456789abcdef01234567';
const RELEASE = JSON.parse(fs.readFileSync(path.join(ROOT, SOURCE_ROOT, 'release.json'), 'utf8'));

// Behaves like `codex plugin marketplace list|upgrade --json` and `codex app-server` for one Git marketplace.
const FAKE_CODEX = `#!/usr/bin/env node
const fs = require('node:fs'), path = require('node:path');
const spec = JSON.parse(fs.readFileSync(process.env.FAKE_CODEX_SPEC, 'utf8'));
const home = process.env.CODEX_HOME, args = process.argv.slice(2).filter(a => a !== '--json');
const cache = path.join(home, 'plugins/cache/momonga/momonga-search');
const out = value => process.stdout.write(JSON.stringify(value));
if (args.join(' ') === 'plugin marketplace list')
  out({ marketplaces: [{ name: 'momonga', root: spec.root, marketplaceSource: { sourceType: 'git', source: spec.source } }] });
else if (args.join(' ') === 'plugin marketplace upgrade momonga' && spec.hang === 'upgrade') hang();
else if (args.join(' ') === 'plugin marketplace upgrade momonga') {
  fs.cpSync(spec.published, spec.root, { recursive: true });
  if (spec.installs) {
    const release = JSON.parse(fs.readFileSync(path.join(spec.root, '${SOURCE_ROOT}/release.json'), 'utf8'));
    fs.rmSync(cache, { recursive: true, force: true });
    fs.cpSync(path.join(spec.root, '${SOURCE_ROOT}'), path.join(cache, release.version), { recursive: true });
  }
  out({ selectedMarketplaces: ['momonga'], upgradedRoots: [spec.root], errors: [] });
} else if (args[0] === 'app-server' && spec.hang === 'app-server') hang();
else if (args[0] === 'app-server') {
  require('node:readline').createInterface({ input: process.stdin }).on('line', line => {
    const message = JSON.parse(line);
    if (message.method === 'initialize') out({ id: message.id, result: {} }), process.stdout.write('\\n');
    if (message.method === 'skills/list') {
      const skills = fs.readdirSync(cache).flatMap(version => fs.readdirSync(path.join(cache, version, 'skills'))
        .map(name => ({ name, path: path.join(cache, version, 'skills', name, 'SKILL.md'), enabled: true, pluginId: 'momonga-search@momonga' })));
      out({ id: message.id, result: { data: [{ cwd: message.params.cwds[0], skills }] } });
      process.stdout.write('\\n');
    }
  });
} else process.exit(2);

// Stops responding, ignores SIGTERM, and leaves a grandchild (like git) running, recording both PIDs.
function hang() {
  const grandchild = require('node:child_process').spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  process.on('SIGTERM', () => {});
  fs.writeFileSync(spec.pids, JSON.stringify([process.pid, grandchild.pid]));
  setInterval(() => {}, 1000);
}
`;

function release(dir, version, revision) {
  const plugin = path.join(dir, SOURCE_ROOT);
  fs.cpSync(path.join(ROOT, SOURCE_ROOT), plugin, { recursive: true });
  fs.writeFileSync(path.join(plugin, 'release.json'), JSON.stringify({ ...RELEASE, version, revision }));
  // The CLI clones the marketplace with Git, checked out at the configured ref.
  fs.mkdirSync(path.join(dir, '.git/refs/heads'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.git/HEAD'), 'ref: refs/heads/main\n');
  fs.writeFileSync(path.join(dir, '.git/refs/heads/main'), COMMIT + '\n');
}

// An installed 1.0.0 (revision 1) plugin whose GitHub repository now publishes `published`.
function setup({ published, installs = true, source = RELEASE.repository + '.git', hang = false }) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'momonga-refresh-'));
  const home = path.join(base, 'home');
  const installed = path.join(home, 'plugins/cache/momonga/momonga-search/1.0.0');
  release(path.join(base, 'installed'), '1.0.0', 1);
  fs.cpSync(path.join(base, 'installed', SOURCE_ROOT), installed, { recursive: true });
  release(path.join(base, 'published'), published.version, published.revision);
  const spec = { root: path.join(home, '.tmp/marketplaces/momonga'), published: path.join(base, 'published'), installs, source,
    hang, pids: path.join(base, 'pids.json') };
  fs.writeFileSync(path.join(base, 'spec.json'), JSON.stringify(spec));
  fs.writeFileSync(path.join(base, 'codex'), FAKE_CODEX, { mode: 0o755 });
  // Copy the helper out of the cache: the upgrade deletes the version directory, as in the real app.
  const helper = path.join(base, 'helper.cjs');
  fs.copyFileSync(HELPER, helper);
  const { refresh } = require(helper);
  process.env.FAKE_CODEX_SPEC = path.join(base, 'spec.json');
  const env = { ...process.env, CODEX_HOME: home };
  return {
    home: fs.realpathSync(home),
    // PIDs of the hung child and its grandchild, once both are running.
    pids: () => fs.existsSync(spec.pids) ? JSON.parse(fs.readFileSync(spec.pids, 'utf8')) : null,
    // The helper as the skill runs it: a separate process from the installed cache.
    spawnHelper: (required, command) => spawn(process.execPath, [path.join(installed, 'scripts/refresh.cjs'), path.join(base, 'codex'), String(required), command],
      { env, stdio: ['ignore', 'pipe', 'pipe'] }),
    run: (required, command, budget) => refresh({ binary: path.join(base, 'codex'), required, command },
      { home: fs.realpathSync(home), scriptRoot: fs.realpathSync(installed), budget }),
  };
}

test('updates from GitHub and returns the newly active skill of the requested command', async () => {
  const { home, run } = setup({ published: { version: '1.1.0', revision: 2 } });
  const result = await run(2, 'news-feed');
  const skillPath = path.join(home, 'plugins/cache/momonga/momonga-search/1.1.0', RELEASE.commands['news-feed']);
  assert.deepStrictEqual(result, { revision: 2, version: '1.1.0', marketplace_ref: 'main', commit: COMMIT, skill_path: skillPath });
  assert.ok(fs.readFileSync(skillPath, 'utf8').includes('news-feed'));
});

test('fails when GitHub does not yet publish the required revision', async () => {
  const { run } = setup({ published: { version: '1.0.1', revision: 1 } });
  await assert.rejects(run(2, 'comps'), /GitHub \(main @ 0123456789ab\) has skill revision 1, older than the required 2/);
});

test('fails when the fetched release is not reflected in the installed plugin', async () => {
  const { run } = setup({ published: { version: '1.1.0', revision: 2 }, installs: false });
  await assert.rejects(run(2, 'comps'), /1\.1\.0 was fetched but is not installed/);
});

test('refuses to upgrade a marketplace that is not the Momonga GitHub repository', async () => {
  const { run } = setup({ published: { version: '1.1.0', revision: 2 }, source: 'https://github.com/someone/fork.git' });
  await assert.rejects(run(2, 'comps'), /not the GitHub repository/);
});

const stopped = pid => { try { process.kill(pid, 0); return false; } catch (error) { return error.code === 'ESRCH'; } };

for (const stage of ['upgrade', 'app-server']) {
  test(`a hung ${stage} fails the update within the budget, and it and its children are stopped before the helper returns`, async () => {
    const { run, pids } = setup({ published: { version: '1.1.0', revision: 2 }, hang: stage });
    const started = Date.now();
    await assert.rejects(run(2, 'comps', 1500), /Timed out/);
    assert.ok(Date.now() - started < 1500 + 5000);
    assert.ok(pids().every(stopped), JSON.stringify(pids()));
  });
}

test('interrupting the helper stops the update it started and reports failure', async () => {
  const { spawnHelper, pids } = setup({ published: { version: '1.1.0', revision: 2 }, hang: 'upgrade' });
  const helper = spawnHelper(2, 'comps');
  const exited = new Promise(resolve => helper.once('exit', resolve));
  while (!pids()) await new Promise(resolve => setTimeout(resolve, 50));
  helper.kill('SIGTERM');
  assert.notStrictEqual(await exited, 0);
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.ok(pids().every(stopped), JSON.stringify(pids()));
});

test('rejects a command the release does not define', async () => {
  const { run } = setup({ published: { version: '1.1.0', revision: 2 } });
  await assert.rejects(run(2, 'unknown'), /Unknown command/);
});

test('the command line reports a malformed required revision as a failure', () => {
  assert.throws(() => execFileSync(process.execPath, [HELPER, 'codex', '0', 'comps'], { stdio: 'pipe' }),
    error => error.status === 1 && /positive required revision/.test(error.stderr.toString()));
});
