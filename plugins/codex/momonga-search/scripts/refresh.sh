#!/bin/sh
set -eu
# Workspace installations must not require a local update runtime or contact GitHub.
plugin_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
plugin_cache=$(dirname -- "$plugin_root")
marketplace_cache=$(dirname -- "$plugin_cache")
cache_root=$(dirname -- "$marketplace_cache")
if [ "$(basename -- "$cache_root")" = cache ] &&
   [ "$(basename -- "$(dirname -- "$cache_root")")" = plugins ] &&
   [ "$(basename -- "$plugin_cache")" = momonga-search ]; then
  # Codex reserves these names for remote-managed packages; Git marketplaces cannot claim them.
  case "$(basename -- "$marketplace_cache")" in
    workspace-directory|workspace-shared-with-me|workspace-shared-with-me-private|workspace-shared-with-me-unlisted|created-by-me-remote|openai-curated-remote)
      printf '%s\n' '{"status":"workspace_managed"}'
      exit 0
      ;;
  esac
fi
codex_home=$(CDPATH= cd -- "${CODEX_HOME:-$HOME/.codex}" && pwd -P)
if [ "$(dirname -- "$plugin_root")" != "$codex_home/plugins/cache/momonga/momonga-search" ]; then
  echo 'Run the updater of the installed personal Momonga plugin.' >&2
  exit 1
fi
# Use the runtime shipped with the desktop app; no separate Node installation.
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
exec "$selected/Contents/Resources/cua_node/bin/node" "$plugin_root/scripts/refresh.cjs" \
  "$selected/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex" "$@"
