---
name: 設備投資計画
description: 設備の新設等の計画の総額・既支払額・残額・完了予定を企業横断で並べる（/設備投資計画）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は capex-plans のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`capex-plans`、client=`codex` で一度呼び、返された手順に従う。
