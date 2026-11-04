---
name: TAMSAMSOM
description: 事業の TAM・SAM・SOM の候補を、開示とニュースから出典つきで揃える（/TAMSAMSOM）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は tamsamsom のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`tamsamsom`、client=`codex` で一度呼び、返された手順に従う。
