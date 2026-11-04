---
name: 用語推移
description: 固定した企業群の有報で、用語を書いた会社の数と初出の年度を年度ごとに数える（/用語推移）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は term-trend のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`term-trend`、client=`codex` で一度呼び、返された手順に従う。
