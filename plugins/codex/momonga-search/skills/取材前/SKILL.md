---
name: 取材前
description: 担当企業と競合を同じ型で並べ、取材で確認する点を付ける（/取材前）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は interview のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`interview`、client=`codex` で一度呼び、返された手順に従う。
