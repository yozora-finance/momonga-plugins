---
name: sozai
description: スライド 1 枚分の数値・引用・脚注と、それだけで書いたスライド草案を作る（/素材）
disable-model-invocation: true
---

このSkillでは、最初のツール呼び出しより前から、分析結果の表示または必要な質問まで、進捗説明を一切出さない。実行します・確認中・最新版・更新不要・workspaceなのでスキップ等の前置きも不要。正常なら黙って分析へ進む。失敗して進めない場合だけ理由と対処を短く伝える。
呼び出されたSKILL.mdの実際のパスを確認する（パス区切りの / と \ は同じものとして扱う）。
plugins/cache/<配布元>/momonga-search/<版>/ の配布元が workspace-directory・workspace-shared-with-me・workspace-shared-with-me-private・workspace-shared-with-me-unlisted・created-by-me-remote・openai-curated-remote なら、Codexの管理配布なので更新をスキップして下の手順へ進む。
個人GitHub導入（plugins/cache/momonga/momonga-search/）では、次のコードの SKILL_ABSOLUTE_PATH を呼び出されたSKILL.mdの絶対パスに置き換え、引数 `material` で1回実行し、完了まで待つ。版番号つきのスクリプトパスは保存・再利用しない。更新で以前の版が削除されても、毎回固定のキャッシュ親フォルダから現在のスクリプトを解決する。更新要否をモデルで判断しない。対象企業などの入力が不足していても、質問やstart_commandより先に必ず実行する。
```sh
sh -c 'set -eu; command_id=$2; plugin_cache=${1%/skills/*}; plugin_cache=${plugin_cache%/*}; set -- "$plugin_cache"/*/scripts/refresh.sh; if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then echo "Expected exactly one installed Momonga update script" >&2; exit 1; fi; exec sh "$1" "$command_id"' sh 'SKILL_ABSOLUTE_PATH' 'material'
```
workspace_managedなら下の手順へ進む。readyなら返されたskill_pathを以後のSkillの実パスとして扱い、返されたskill_bodyが最新版のSkill本文なので、その内容に従う。この実行では更新スクリプトを繰り返し呼ばない。ファイルの再読込や別Codexでの認識確認は不要。
失敗した場合、実パスが不明な場合、上記以外の導入元の場合は理由を示して止める。

モモンガの `start_command` を `material` で呼び出し、返された手順に従う。
