"""Build a cloud update ZIP, preserving its registered technical identity.

Usage: python3 .github/package-openai.py REGISTERED_PLUGIN_ZIP OUTPUT_ZIP
"""
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def package(root, registration, output):
    market = json.loads((root / '.agents/plugins/marketplace.json').read_text())
    source = (root / market['plugins'][0]['source']['path']).resolve()
    if not source.is_relative_to(root.resolve()):
        raise ValueError('Plugin source must stay in repository')
    manifest = json.loads((source / '.codex-plugin/plugin.json').read_text())
    apps = json.loads((source / '.app.json').read_text())
    with zipfile.ZipFile(registration) as registered:
        identity = json.loads(registered.read('.codex-plugin/plugin.json'))
        registered_apps = json.loads(registered.read('.app.json'))
    app_ids = lambda value: sorted(app['id'] for app in value['apps'].values())
    if app_ids(apps) != app_ids(registered_apps) or len(app_ids(apps)) != 1:
        raise ValueError('Registered app differs from generated app; regenerate for this connection')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', identity['name']) or len(identity['name']) > 64:
        raise ValueError('Invalid registered plugin name')
    if identity['version'] == manifest['version']:
        raise ValueError('Cloud update requires a new version')
    manifest['name'] = identity['name']
    files = {'.codex-plugin/plugin.json': json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
             '.app.json': json.dumps(apps, ensure_ascii=False, indent=2) + '\n'}
    for skill in sorted((source / 'skills').glob('*/SKILL.md')):
        files[str(skill.relative_to(source))] = skill.read_text()
    if len(files) != 26:
        raise ValueError('Expected 24 command skills and two manifests')
    if output.resolve().is_relative_to(source):
        raise ValueError('Output must be outside the generated plugin')
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, body in files.items():
            archive.writestr(name, body)
    return manifest['name'], manifest['version']


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    try:
        name, version = package(ROOT, Path(sys.argv[1]), Path(sys.argv[2]))
        print(f'{name}: version {version}, 24 skills -> {sys.argv[2]}')
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as error:
        sys.exit(str(error))
