#!/bin/sh
set -eu
# Use the runtime shipped with the desktop app; no user-installed runtime required.
selected=''
for app in /Applications/ChatGPT.app "$HOME/Applications/ChatGPT.app"; do
  if [ -x "$app/Contents/Resources/cua_node/bin/node" ] &&
     [ -x "$app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex" ]; then
    if [ -n "$selected" ]; then
      echo 'Multiple supported desktop apps found. Resolve the duplicate installation before updating.' >&2
      exit 1
    fi
    selected="$app"
  fi
done
if [ -z "$selected" ]; then
  echo 'Supported desktop app runtime not found. Update the desktop app and retry.' >&2
  exit 1
fi
exec "$selected/Contents/Resources/cua_node/bin/node" "$(dirname "$0")/refresh.cjs" \
  "$selected/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex" "$@"
