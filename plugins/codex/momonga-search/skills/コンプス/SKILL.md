---
name: コンプス
description: 対象会社と事業が近い上場企業を、同じ観点・同じ有報で並べる（/コンプス）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は comps のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`comps`、client=`codex` で一度呼び、返された手順に従う。
