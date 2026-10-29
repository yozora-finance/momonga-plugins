"""Add Momonga skills to the user's own registered ChatGPT plugin.

Usage: python3 .github/bind-openai.py REGISTERED_PLUGIN_ZIP OUTPUT_ZIP --version VERSION
The registered ZIP remains local. The output keeps its connection and technical identity.
"""
import argparse
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def semver(value):
    if not isinstance(value, str) or not re.fullmatch(r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)', value):
        raise ValueError('Explicit semantic version required')
    return tuple(map(int, value.split('.')))


def bind(root, registration, output, version):
    target_version = semver(version)
    if registration.resolve() == output.resolve():
        raise ValueError('Output must not overwrite the registered ZIP')
    market = json.loads((root / '.agents/plugins/marketplace.json').read_text())
    source = (root / market['plugins'][0]['source']['path']).resolve()
    if not source.is_relative_to(root.resolve()):
        raise ValueError('Plugin source must stay in repository')
    if output.resolve().is_relative_to(root.resolve()):
        raise ValueError('Account-specific output must stay outside the public repository')
    with zipfile.ZipFile(registration) as archive:
        identity = json.loads(archive.read('.codex-plugin/plugin.json'))
        apps = json.loads(archive.read('.app.json'))['apps']
    name = identity['name']
    if not isinstance(name, str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name) or len(name) > 64:
        raise ValueError('Invalid registered plugin name')
    if target_version <= semver(identity['version']):
        raise ValueError('Upload version must be newer than the registered version')
    if not isinstance(apps, dict) or len(apps) != 1:
        raise ValueError('Exactly one registered Momonga connection required')
    app = next(iter(apps.values()))
    app_id = app.get('id') if isinstance(app, dict) else None
    if not isinstance(app_id, str) or not re.fullmatch(r'asdk_app_[a-f0-9]{32}', app_id):
        raise ValueError('Registered ChatGPT MCP app ID required')
    manifest = json.loads((source / '.codex-plugin/plugin.json').read_text())
    manifest.pop('mcpServers', None)
    manifest.update(name=name, version=version, apps='./.app.json', skills='./skills/')
    files = {
        '.codex-plugin/plugin.json': json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
        '.app.json': json.dumps({'apps': {'momonga': {'id': app_id, 'required': True}}}, indent=2) + '\n',
    }
    skills = sorted((source / 'skills').glob('*/SKILL.md'))
    if len(skills) != 24:
        raise ValueError('Expected 24 command skills')
    for skill in skills:
        files[str(skill.relative_to(source))] = skill.read_text()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for relative, body in files.items():
            archive.writestr(relative, body)
    return name, version


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('registration', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--version', required=True)
    args = parser.parse_args()
    try:
        name, version = bind(ROOT, args.registration, args.output, args.version)
        print(f'{name}: version {version}, 24 skills -> {args.output}')
    except (ValueError, KeyError, TypeError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, str(error) + '\n')
