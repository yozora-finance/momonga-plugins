---
name: 市場規模
description: 事業の市場全体（日本）の規模の材料を、資料に書かれた市場規模・供給側の売上・顧客側の支出の 3 段で並べる（/市場規模）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は market-size のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`market-size`、client=`codex` で一度呼び、返された手順に従う。
