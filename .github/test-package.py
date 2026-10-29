import json
from pathlib import Path
import runpy
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
package = runpy.run_path(str(ROOT / '.github/package-openai.py'))['package']
SOURCE = ROOT / 'plugins/codex/momonga-search'


class CloudPackageTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.registration = Path(self.temp.name) / 'registered.zip'
        self.output = Path(self.temp.name) / 'upload.zip'

    def register(self, app=None, version='0.2.0'):
        apps = json.loads((SOURCE / '.app.json').read_text())
        if app:
            next(iter(apps['apps'].values()))['id'] = app
        with zipfile.ZipFile(self.registration, 'w') as z:
            z.writestr('.codex-plugin/plugin.json', json.dumps({'name': 'dev-fixture', 'version': version}))
            z.writestr('.app.json', json.dumps(apps))

    def test_upload_preserves_registered_identity_and_all_command_skills(self):
        self.register()
        package(ROOT, self.registration, self.output)
        with zipfile.ZipFile(self.output) as z:
            manifest = json.loads(z.read('.codex-plugin/plugin.json'))
            expected = json.loads((SOURCE / '.codex-plugin/plugin.json').read_text())
            expected['name'] = 'dev-fixture'
            self.assertEqual(manifest, expected)
            self.assertEqual(json.loads(z.read('.app.json')), json.loads((SOURCE / '.app.json').read_text()))
            skills = sorted((SOURCE / 'skills').glob('*/SKILL.md'))
            self.assertEqual(len(skills), 24)
            self.assertEqual(len(z.namelist()), 26)
            for skill in skills:
                self.assertEqual(z.read(str(skill.relative_to(SOURCE))).decode(), skill.read_text())

    def test_upload_rejects_a_different_registered_connection(self):
        self.register(app='asdk_app_00000000000000000000000000000000')
        with self.assertRaisesRegex(ValueError, 'Registered app differs'):
            package(ROOT, self.registration, self.output)

    def test_upload_requires_a_new_cloud_version(self):
        version = json.loads((SOURCE / '.codex-plugin/plugin.json').read_text())['version']
        self.register(version=version)
        with self.assertRaisesRegex(ValueError, 'new version'):
            package(ROOT, self.registration, self.output)


if __name__ == '__main__':
    unittest.main()
