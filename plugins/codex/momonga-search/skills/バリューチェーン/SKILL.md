---
name: バリューチェーン
description: 1 社を起点に、相手側と自社の開示から取引先・資本・技術の関係を集め、工程に並べた図と根拠の表にする（/バリューチェーン）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は value-chain のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`value-chain`、client=`codex` で一度呼び、返された手順に従う。
