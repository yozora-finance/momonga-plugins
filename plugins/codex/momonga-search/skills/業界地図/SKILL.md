---
name: 業界地図
description: 事業を営む上場企業を、事業系統・該当事業の売上・資本と取引の矢印で四季報型の地図にする（/業界地図）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は industry-map のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`industry-map`、client=`codex` で一度呼び、返された手順に従う。
