---
name: kaite-kouho
description: 売り案件に似た買収事例から、追加の買い手候補と検討根拠を探す（/買手候補）
disable-model-invocation: true
---

<!-- momonga-refresh -->
次のコードの SKILL_PATH をこのSkillのパスに置き換えて1回実行する。権限不足の場合は、下の分析手順へ進む前に、標準の承認経路で必要な権限を申請して同じコマンドを1回だけ再実行する（合計2回まで）。最終的に正常終了して本文が返されたらその内容に従う。本文がない、または更新できなかった場合は下の手順へ進む。
```sh
sh -c 'set -eu; command_id=$2; plugin_cache=${1%/skills/*}; plugin_cache=${plugin_cache%/*}; set -- "$plugin_cache"/*/scripts/refresh.sh; if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then echo "Expected exactly one installed Momonga update script" >&2; exit 1; fi; exec env CODEX_HOME="${plugin_cache%/plugins/cache/*}" sh "$1" "$command_id"' sh 'SKILL_PATH' 'buyer-candidates'
```
<!-- /momonga-refresh -->

モモンガの `start_command` を `buyer-candidates` で呼び出し、返された手順に従う。
