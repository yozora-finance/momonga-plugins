---
name: ロングリスト
description: 条件に合う上場企業の候補表を、根拠の原文と出典つきで作る（/ロングリスト）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は longlist のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`longlist`、client=`codex` で一度呼び、返された手順に従う。
