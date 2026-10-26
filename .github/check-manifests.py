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
