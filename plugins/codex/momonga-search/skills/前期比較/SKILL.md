---
name: 前期比較
description: 1 社の同じ節を 2 期で比べ、変わった点だけを並べる（/前期比較）
disable-model-invocation: true
---

更新確認の予告や成功報告はせず、この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は yoy のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`yoy`、client=`codex` で一度呼び、返された手順に従う。
