"""Package the standalone desktop plugin for distribution.

Usage: python3 .github/package-openai.py OUTPUT_ZIP
"""
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def package(root, output):
    market = json.loads((root / '.agents/plugins/marketplace.json').read_text())
    source = (root / market['plugins'][0]['source']['path']).resolve()
    if not source.is_relative_to(root.resolve()):
        raise ValueError('Plugin source must stay in repository')
    manifest = json.loads((source / '.codex-plugin/plugin.json').read_text())
    if output.resolve().is_relative_to(source):
        raise ValueError('Output must be outside the generated plugin')
    paths = [source / '.codex-plugin/plugin.json', source / '.mcp.json', source / 'release.json']
    skills = sorted((source / 'skills').glob('*/SKILL.md'))
    if len(skills) != 24:
        raise ValueError('Expected 24 command skills')
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for item in paths + skills:
            archive.writestr(str(item.relative_to(source)), item.read_bytes())
    return manifest['name'], manifest['version']


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    try:
        name, version = package(ROOT, Path(sys.argv[1]))
        print(f'{name}: version {version}, 24 skills -> {sys.argv[1]}')
    except (ValueError, KeyError, OSError) as error:
        sys.exit(str(error))
