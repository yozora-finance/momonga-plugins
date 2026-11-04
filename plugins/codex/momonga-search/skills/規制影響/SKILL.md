---
name: 規制影響
description: 制度変更への言及と対応を、企業群の有報から期ごとに数える（/規制影響）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は regulation のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`regulation`、client=`codex` で一度呼び、返された手順に従う。
