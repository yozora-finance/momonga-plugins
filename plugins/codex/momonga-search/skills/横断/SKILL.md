---
name: 横断
description: 企業リストに同じ問いを当て、観点ごとに要点と原文を並べる（/横断）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は crosscut のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`crosscut`、client=`codex` で一度呼び、返された手順に従う。
