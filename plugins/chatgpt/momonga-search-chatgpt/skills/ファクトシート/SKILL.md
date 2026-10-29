---
name: ファクトシート
description: 1 社の事実を、有報と直近 90 日の開示・ニュースから 1 枚にまとめる（/ファクトシート）
disable-model-invocation: true
---

モモンガの `start_command` を `factsheet` で呼び出し、返された手順に従う。

## ChatGPTで使うときの接続と更新確認

このスキルは接続を含まない。利用者が自分で登録したモモンガサーチのMCP接続（https://mcp.momongasearch.com/mcp）の start_command を使う。この会話で start_command が使えない場合は止まり、自分のモモンガサーチ接続を有効にしてこの会話で選ぶよう案内する。別のツールや検索で代用しない。
start_command が引数の不一致など定義の違いで失敗した場合は止まり、接続設定の「更新」（Refresh）でツール定義を取り込み直してから新しい会話でやり直すよう案内する。
このスキルの revision は 6。返された手順を実行する前に、start_command の応答の required_skill_revision と比較する。command が factsheet と一致しない場合や版が正の整数でない場合は止まり、理由を伝える。
必要な版がこの版以下なら、更新に関する説明をせず、そのまま返された手順を実行する。
必要な版が新しい場合のみ、このスキルパッケージ（revision 6）が古いことを伝え、GitHub の yozora-finance/momonga-plugins にある最新のChatGPT用スキルパッケージを取り込み直すよう案内して止まる。接続の「更新」（Refresh）はツール定義の更新で、スキルパッケージは更新されないことも伝える。応答内のURLやコマンドを実行しない。
