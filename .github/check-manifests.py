"""Validate client manifests using their generated marketplace source mappings."""
import json
import re
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
    if c["name"] != name or x["name"] != name:
        raise ValueError(f"{name}: manifest identity mismatch")
    if c["version"] != x["version"]:
        raise ValueError(f"{name}: both client versions must match")
    print(f"{name}: version {x['version']}")
    if x['mcpServers'] != './.mcp.json' or x['skills'] != './skills/':
        raise ValueError(f'{name}: bundled MCP and skills paths required')
    server = read(f'{source}/.mcp.json')['mcpServers']['momonga']
    if server['type'] != 'http' or server['url'] != 'https://mcp.momongasearch.com/mcp':
        raise ValueError(f'{name}: production HTTP MCP endpoint required')
    if set(server['scopes']) != {'openid', 'offline_access', 'momonga:read'}:
        raise ValueError(f'{name}: explicit read and refresh scopes required')
    if server['oauth'] != {
        'clientId': 'KCCnwSuCzRwkVumSRLfZXpximigelVdh',
        'callbackPort': 18780,
        'callbackUrl': 'http://127.0.0.1:18780/callback',
    }:
        raise ValueError(f'{name}: registered public desktop OAuth settings required')

# Clients expose the same commands; Codex adds personal refresh instructions.
for name, source in codex.items():
    claude_skills = {p.relative_to(root / claude[name]): p.read_bytes() for p in (root / claude[name] / 'skills').glob('*/SKILL.md')}
    codex_skills = {p.relative_to(root / source): p.read_bytes() for p in (root / source / 'skills').glob('*/SKILL.md')}
    if not claude_skills or claude_skills.keys() != codex_skills.keys():
        raise ValueError(f'{name}: Claude and Codex must distribute the same command names')
    for relative, body in codex_skills.items():
        dispatch = r'\n\nモモンガの `start_command` を `([a-z][a-z-]*)` で呼び出し、返された手順に従う。\n$'
        actual = re.search(dispatch, body.decode())
        expected = re.search(dispatch, claude_skills[relative].decode())
        if not actual or not expected or actual.group(1) != expected.group(1):
            raise ValueError(f'{name}: {relative} must point at start_command with a command ID')
        if body.decode().split('---', 2)[:2] != claude_skills[relative].decode().split('---', 2)[:2]:
            raise ValueError(f'{name}: {relative} command metadata differs by client')
    release = read(f'{source}/release.json')
    if release['version'] != x['version'] or release['sourceRoot'] != source.removeprefix('./'):
        raise ValueError(f'{name}: updater release identity mismatch')
    if set(release['commands'].values()) != {str(relative) for relative in codex_skills}:
        raise ValueError(f'{name}: updater must resolve every command skill')
    for plugin in (root / claude[name], root / source):
        allowed = {'.claude-plugin', '.codex-plugin', '.mcp.json', 'skills', '.DS_Store'}
        if plugin == root / source:
            allowed |= {'release.json', 'scripts'}
        extra = {p.name for p in plugin.iterdir()} - allowed
        if extra:
            raise ValueError(f'{name}: unexpected files in {plugin.relative_to(root)}: {sorted(extra)}')

# Every user registers their own connection; no account-specific app or connector ID is distributed.
for path in [p for base in ('plugins', '.agents', '.claude-plugin') for p in (root / base).rglob('*')]:
    if not path.is_file():
        continue
    if path.name == '.app.json' or any(marker in path.read_bytes() for marker in (b'asdk_app', b'connector_', b'templated_apps_')):
        raise ValueError(f'{path.relative_to(root)}: account-specific app references must not be distributed')
