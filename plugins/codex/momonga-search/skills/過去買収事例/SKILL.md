---
name: 過去買収事例
description: 売り案件に似た会社・事業の買収事例を、取引形態・取得対価・対象会社の業績つきで並べる（/過去買収事例）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は past-acquisitions のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`past-acquisitions`、client=`codex` で一度呼び、返された手順に従う。
