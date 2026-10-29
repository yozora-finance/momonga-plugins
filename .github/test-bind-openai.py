import json
from pathlib import Path
import runpy
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
bind = runpy.run_path(str(ROOT / '.github/bind-openai.py'))['bind']
SOURCE = ROOT / 'plugins/codex/momonga-search'


class UserConnectionPackageTest(unittest.TestCase):
    def registration(self, path, name, app_id, version='1.0.0'):
        with zipfile.ZipFile(path, 'w') as archive:
            archive.writestr('.codex-plugin/plugin.json', json.dumps({'name': name, 'version': version}))
            archive.writestr('.app.json', json.dumps({'apps': {'input': {'id': app_id}}}))

    def test_each_user_keeps_their_own_connection_and_registered_identity_with_all_skills(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            for suffix in ['a', 'b']:
                with self.subTest(user=suffix):
                    app_id = 'asdk_app_' + suffix * 32
                    name = 'dev-' + suffix * 32
                    registration, output = directory / f'{suffix}-input.zip', directory / f'{suffix}-output.zip'
                    self.registration(registration, name, app_id)
                    self.assertEqual(bind(ROOT, registration, output, '1.0.1'), (name, '1.0.1'))
                    with zipfile.ZipFile(output) as archive:
                        manifest = json.loads(archive.read('.codex-plugin/plugin.json'))
                        self.assertEqual(manifest['name'], name)
                        self.assertEqual(manifest['version'], '1.0.1')
                        apps = json.loads(archive.read(manifest['apps'].removeprefix('./')))
                        self.assertEqual(apps, {'apps': {'momonga': {'id': app_id, 'required': True}}})
                        expected = {'.codex-plugin/plugin.json', '.app.json'}
                        for skill in (SOURCE / 'skills').glob('*/SKILL.md'):
                            relative = str(skill.relative_to(SOURCE))
                            expected.add(relative)
                            self.assertEqual(archive.read(relative), skill.read_bytes())
                        self.assertEqual(len(expected), 26)
                        self.assertEqual(set(archive.namelist()), expected)

    def test_update_requires_a_newer_version_than_the_users_registration(self):
        with tempfile.TemporaryDirectory() as directory:
            registration, output = Path(directory) / 'input.zip', Path(directory) / 'output.zip'
            self.registration(registration, 'user-plugin', 'asdk_app_' + 'a' * 32, '2.0.0')
            for version in ['1.0.9', '2.0.0']:
                with self.subTest(version=version), self.assertRaisesRegex(ValueError, 'newer'):
                    bind(ROOT, registration, output, version)

    def test_account_specific_artifact_must_stay_outside_the_public_repository(self):
        with self.assertRaisesRegex(ValueError, 'outside the public repository'):
            bind(ROOT, Path('/tmp/input.zip'), ROOT / 'user-plugin.zip', '1.0.1')

    def test_input_must_reference_a_registered_chatgpt_mcp_app(self):
        with tempfile.TemporaryDirectory() as directory:
            registration, output = Path(directory) / 'input.zip', Path(directory) / 'output.zip'
            self.registration(registration, 'user-plugin', 'invalid')
            with self.assertRaisesRegex(ValueError, 'MCP app ID'):
                bind(ROOT, registration, output, '1.0.1')


if __name__ == '__main__':
    unittest.main()
