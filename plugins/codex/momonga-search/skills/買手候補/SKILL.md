---
name: 買手候補
description: 売り案件に似た買収事例から、追加の買い手候補と検討根拠を探す（/買手候補）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は buyer-candidates のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`buyer-candidates`、client=`codex` で一度呼び、返された手順に従う。
