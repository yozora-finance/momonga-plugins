---
name: 新着
description: 企業リストの適時開示・EDINET・ニュース記事の3種類を、期間指定か前回確認からの差分で一覧にする（/新着）
disable-model-invocation: true
---

この SKILL.md からの相対パス ../../scripts/refresh.sh を sh で実行する。引数は news-feed のみ。完了まで待つ。
失敗したら出力の理由と案内を伝えて止まる。更新された場合は出力の skill_path を読み、この呼び出しでは更新確認を繰り返さない。
成功したらモモンガの `start_command` を command=`news-feed`、client=`codex` で一度呼び、返された手順に従う。
