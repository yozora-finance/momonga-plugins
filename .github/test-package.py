import json
from pathlib import Path
import runpy
import shutil
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
package = runpy.run_path(str(ROOT / '.github/package-openai.py'))['package']
package_chatgpt = runpy.run_path(str(ROOT / '.github/package-chatgpt.py'))['package']
generate = runpy.run_path(str(ROOT / '.github/generate.py'))
SOURCE = ROOT / 'plugins/codex/momonga-search'
SHARED = ROOT / 'plugins/momonga-search'
RELEASE = json.loads((SOURCE / 'release.json').read_text())


def copy_repository(directory):
    target = Path(directory) / 'repo'
    shutil.copytree(ROOT, target, ignore=shutil.ignore_patterns('.git'))
    return target


class DesktopPackageTest(unittest.TestCase):
    def test_archive_supplies_stable_identity_connection_update_helper_and_all_command_skills(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'momonga.zip'
            identity = package(ROOT, output)
            self.assertEqual(identity, ('momonga-search', RELEASE['version']))
            with zipfile.ZipFile(output) as archive:
                expected = ['.codex-plugin/plugin.json', '.mcp.json', 'release.json', 'scripts/refresh.cjs', 'scripts/refresh.sh']
                expected += [str(skill.relative_to(SOURCE)) for skill in sorted((SOURCE / 'skills').glob('*/SKILL.md'))]
                self.assertEqual(len(expected), 29)
                self.assertEqual(sorted(archive.namelist()), sorted(expected))
                for relative in expected:
                    self.assertEqual(archive.read(relative), (SOURCE / relative).read_bytes())
                manifest = json.loads(archive.read('.codex-plugin/plugin.json'))
                connection = json.loads(archive.read(manifest['mcpServers'].removeprefix('./')))
                self.assertEqual(connection['mcpServers']['momonga']['url'], 'https://mcp.momongasearch.com/mcp')

    def test_archive_output_must_stay_outside_the_plugin_source(self):
        with self.assertRaisesRegex(ValueError, 'Output must be outside'):
            package(ROOT, SOURCE / 'package.zip')


class GeneratedSkillsTest(unittest.TestCase):
    def test_codex_skill_is_the_shared_skill_followed_by_its_revision_check_and_helper(self):
        for command, relative in RELEASE['commands'].items():
            codex = (SOURCE / relative).read_text()
            check = codex.removeprefix((SHARED / relative).read_text())
            self.assertNotEqual(check, codex, command)
            self.assertIn(f'revision は {RELEASE["revision"]}', check)
            self.assertIn(f'command が {command} と一致しない', check)
            self.assertIn('../../scripts/refresh.sh', check)
            self.assertTrue((SOURCE / relative).parent.joinpath('../../scripts/refresh.sh').resolve().is_file())

    def test_editing_a_shared_skill_marks_both_generated_hosts_stale_until_regenerated(self):
        with tempfile.TemporaryDirectory() as directory:
            root = copy_repository(directory)
            relative = RELEASE['commands']['news-feed']
            shared = root / 'plugins/momonga-search' / relative
            shared.write_text(shared.read_text() + '\n追加の説明。\n')
            with self.assertRaisesRegex(ValueError, 'out of date') as raised:
                generate['main'](check=True, root=root)
            self.assertIn(f'plugins/codex/momonga-search/{relative}', str(raised.exception))
            self.assertIn(f'plugins/chatgpt/momonga-search-chatgpt/{relative}', str(raised.exception))
            generate['main'](check=False, root=root)
            generate['main'](check=True, root=root)
            for host in ('plugins/codex/momonga-search', 'plugins/chatgpt/momonga-search-chatgpt'):
                self.assertTrue((root / host / relative).read_text().startswith(shared.read_text()))

    def test_a_platform_rewrite_of_the_shared_inputs_keeps_the_helper_and_every_host_check(self):
        with tempfile.TemporaryDirectory() as directory:
            root = copy_repository(directory)
            # The platform replaces the shared skills and the command index; here it renames one skill.
            commands = json.loads((root / 'plugins/commands.json').read_text())
            old = commands['comps']
            commands['comps'] = 'skills/比較会社/SKILL.md'
            skills = root / 'plugins/momonga-search'
            (skills / commands['comps']).parent.mkdir()
            (skills / old).rename(skills / commands['comps'])
            (skills / old).parent.rmdir()
            (root / 'plugins/commands.json').write_text(json.dumps(commands, ensure_ascii=False, indent=2) + '\n')
            generate['main'](check=False, root=root)
            generate['main'](check=True, root=root)
            codex = root / 'plugins/codex/momonga-search'
            self.assertEqual(json.loads((codex / 'release.json').read_text())['commands'], commands)
            self.assertTrue((codex / 'scripts/refresh.sh').is_file() and (codex / 'scripts/refresh.cjs').is_file())
            for host, marker in (('plugins/codex/momonga-search', '../../scripts/refresh.sh'), ('plugins/chatgpt/momonga-search-chatgpt', 'Refresh')):
                self.assertFalse((root / host / old).exists())
                for command, relative in commands.items():
                    body = (root / host / relative).read_text()
                    self.assertTrue(body.startswith((skills / relative).read_text()), (host, command))
                    self.assertIn(marker, body)

    def test_shared_skills_must_match_the_command_index(self):
        with tempfile.TemporaryDirectory() as directory:
            root = copy_repository(directory)
            extra = root / 'plugins/momonga-search/skills/未登録/SKILL.md'
            extra.parent.mkdir()
            extra.write_text('---\nname: 未登録\n---\n')
            with self.assertRaisesRegex(ValueError, 'exactly the skills listed'):
                generate['main'](check=False, root=root)


class ChatGPTPackageTest(unittest.TestCase):
    def test_archive_is_skills_only_with_every_shared_command_and_no_account_reference(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'chatgpt.zip'
            self.assertEqual(package_chatgpt(ROOT, output), ('momonga-search-chatgpt', RELEASE['version']))
            with zipfile.ZipFile(output) as archive:
                skills = sorted(RELEASE['commands'].values())
                self.assertEqual(sorted(archive.namelist()), sorted(['.codex-plugin/plugin.json'] + skills))
                manifest = json.loads(archive.read('.codex-plugin/plugin.json'))
                self.assertEqual(manifest['skills'], './skills/')
                self.assertFalse({'apps', 'mcpServers'} & manifest.keys())
                for command, relative in RELEASE['commands'].items():
                    body = archive.read(relative).decode()
                    self.assertTrue(body.startswith((SHARED / relative).read_text()), command)
                    self.assertIn(f'revision は {RELEASE["revision"]}', body)
                    self.assertIn(f'command が {command} と一致しない', body)
                    self.assertIn('Refresh', body)
                for name in archive.namelist():
                    self.assertNotIn(b'asdk_app', archive.read(name))

    def test_stale_generated_skill_is_refused(self):
        with tempfile.TemporaryDirectory() as directory:
            root = copy_repository(directory)
            skill = root / 'plugins/chatgpt/momonga-search-chatgpt' / RELEASE['commands']['comps']
            skill.write_text(skill.read_text().replace('start_command', 'other_tool'))
            with self.assertRaisesRegex(ValueError, 'out of date'):
                package_chatgpt(root, Path(directory) / 'chatgpt.zip')

    def test_connection_in_the_skills_package_is_refused(self):
        with tempfile.TemporaryDirectory() as directory:
            root = copy_repository(directory)
            (root / 'plugins/chatgpt/momonga-search-chatgpt/.app.json').write_text('{"apps": {}}')
            with self.assertRaisesRegex(ValueError, 'only its manifest and generated skills'):
                package_chatgpt(root, Path(directory) / 'chatgpt.zip')


if __name__ == '__main__':
    unittest.main()
