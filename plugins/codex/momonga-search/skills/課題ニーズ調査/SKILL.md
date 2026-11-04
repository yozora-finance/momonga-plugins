---
name: 課題ニーズ調査
description: 企業群の課題を言及社数の順に並べる。引用符つきの課題名なら、それを書いている会社を探す（/課題ニーズ調査）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は issue-needs のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`issue-needs`、client=`codex` で一度呼び、返された手順に従う。
