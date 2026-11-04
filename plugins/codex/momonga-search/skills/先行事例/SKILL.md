---
name: 先行事例
description: 取り組みを公表した上場企業と、その後の開示に書かれた結果を出典つきの表にする（/先行事例）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は precedents のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`precedents`、client=`codex` で一度呼び、返された手順に従う。
