---
name: 人的資本
description: 従業員数・平均年収・勤続・年齢を、連結／提出会社の範囲を分けて企業横断で並べる（/人的資本）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は human-capital のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`human-capital`、client=`codex` で一度呼び、返された手順に従う。
