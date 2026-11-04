---
name: 根拠付け
description: 主張 1 件（または貼った資料の先頭の 1 文）の根拠を、範囲の企業群の開示から集める（/根拠付け）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は evidence のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`evidence`、client=`codex` で一度呼び、返された手順に従う。
