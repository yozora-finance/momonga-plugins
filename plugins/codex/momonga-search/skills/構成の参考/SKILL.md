---
name: 構成の参考
description: 他社の節構成・言い回し・図表の有無を、転載せずに並べる（/構成の参考）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は structure-reference のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`structure-reference`、client=`codex` で一度呼び、返された手順に従う。
