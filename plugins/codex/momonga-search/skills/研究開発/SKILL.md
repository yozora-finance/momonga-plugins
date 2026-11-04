---
name: 研究開発
description: 研究開発費・売上高比率・テーマを企業横断で並べる（/研究開発）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は rd のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`rd`、client=`codex` で一度呼び、返された手順に従う。
