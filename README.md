# モモンガサーチ

モモンガサーチの公式プラグイン配布元です。Codex と Claude で分析コマンドを使えます。通常の ChatGPT はサポート対象外です。

- [導入手順](https://momongasearch.com/user-guide/setup)
- [コマンド一覧](https://momongasearch.com/skills#list)
- [困ったとき](https://momongasearch.com/user-guide/troubleshooting)

スキルはモモンガの `start_command` を呼び、返された分析手順に従います。Claudeと会社のワークスペース配布は、各クライアントのマーケットプレイス同期で更新されます。

Codexの個人GitHub導入では、Skill使用時にモデルが更新スクリプトを1回呼びます。スクリプトは毎回配布元のupgradeを実行し、検証済みの最新版Skill本文を返します。その本文に従って分析を続け、同じ実行では更新確認を繰り返しません。会社などCodex管理配布では更新をスキップします。

フックや常駐処理は使いません。個人用の更新に失敗したら理由を表示して停止します。環境によりスクリプト実行の承認が必要です。個人用の実行環境はmacOS Desktop同梱のNode/Codexを利用し、Windows個人用は未対応です。

0.3.7以前にはこの使用時更新がないため、初回は一度プラグインを手動更新し、新しい会話で使ってください。
