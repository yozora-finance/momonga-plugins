import json
from pathlib import Path
import runpy
import shutil
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
package = runpy.run_path(str(ROOT / '.github/package-openai.py'))['package']
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



if __name__ == '__main__':
    unittest.main()
