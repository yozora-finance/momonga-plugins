"""Validate client manifests using their generated marketplace source mappings."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent

def read(relative):
    target = (root / relative).resolve()
    if not target.is_relative_to(root):
        raise ValueError("Manifest source must stay inside this repository")
    return json.loads(target.read_text())

claude = {p["name"]: p["source"] for p in read(".claude-plugin/marketplace.json")["plugins"]}
codex = {p["name"]: p["source"]["path"] for p in read(".agents/plugins/marketplace.json")["plugins"]}
if claude.keys() != codex.keys():
    raise ValueError("Claude and Codex must distribute the same plugin IDs")
for name, source in codex.items():
    c = read(f"{claude[name]}/.claude-plugin/plugin.json")
    x = read(f"{source}/.codex-plugin/plugin.json")
    release = read(f"{source}/release.json")
    if c["name"] != name or x["name"] != name:
        raise ValueError(f"{name}: manifest identity mismatch")
    if c["version"] != x["version"] or x["version"] != release["version"]:
        raise ValueError(f"{name}: all release versions must match")
    if type(release["revision"]) is not int or release["revision"] < 1:
        raise ValueError(f"{name}: positive integer skill revision required")
    print(f"{name}: version {x['version']}, skill revision {release['revision']}")
    if x['apps'] != './.app.json' or x['skills'] != './skills/':
        raise ValueError(f'{name}: shared OpenAI app and skills paths required')
    apps = read(f'{source}/.app.json')['apps']
    if len(apps) != 1 or not next(iter(apps.values()))['id'].startswith('asdk_app_'):
        raise ValueError(f'{name}: one registered ChatGPT app required')
    for command, relative in release['commands'].items():
        shared = (root / claude[name] / relative).read_text()
        if (root / source / relative).read_text() != shared:
            raise ValueError(f'{name}/{command}: both packages must use the shared skill')
