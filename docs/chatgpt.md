# Codex・ChatGPT（アプリ・Web）

[使い方のトップ](README.md)

プラグインを選び、モモンガにログインして使う流れは共通です。
現在、**「モモンガサーチ＋スキル」はデスクトップ用**です。ChatGPT Webでは、下の「Webで初めて接続する場合」から検索用の接続を追加します。

## プラグインを選ぶ

アプリの **「プラグイン」→「ディレクトリ」**を開き、組織名または **「Momonga by Yozora Finance」**の一覧から **「モモンガサーチ＋スキル」**を選んで追加します。

一覧にない場合は、管理者に[プラグインの配布](administrators.md)を依頼してください。GitHubのURLをチャットに貼るだけでは追加されません。組織で配布されていない個人環境では、モモンガの担当者に導入方法を確認してください。

## モモンガにログインする

プラグインの **「Connect／接続」**を押します。
ブラウザでモモンガにログインし、接続の許可を済ませたら元の画面に戻ります。追加したときにログイン画面が開いた場合は、そのまま進めてください。

## 使ってみる

新しいチャットで **`@`** を打ってモモンガを選び、次を送ります。

```text
トヨタ自動車（7203）の直近決算を出典付きで調べて。
```

ツールの使用を確認されたら、内容を見て許可します。モモンガから出典付きの結果が返ってくることを確かめてください。

スキル付き版では、`@` から `factsheet` なども選べます。会社名や調べたい条件を続けて送ってください。

[コマンド一覧](commands.md) ／ [困ったとき](troubleshooting.md)

## Webで初めて接続する場合

Webでは、カスタムMCPを追加できるアカウントで検索を使えます。この方法では24種の分析スキルは入りません。

1. [ChatGPTのプラグイン画面](https://chatgpt.com/plugins)で **「＋」→「Add custom MCP server」**を選びます。
2. 名前を「モモンガサーチ」、説明を「企業・開示資料・ニュースの検索」にします。
3. **Connection**に下のURLを入れ、認証方法に **OAuth** を選びます。
4. OAuthの詳細設定に下のclient IDを入れます。secretは空欄です。

| 欄 | 入れるもの |
|---|---|
| MCP URL | `https://mcp.momongasearch.com/mcp` |
| OAuth client ID | `pwPehWbWGeAMiRSKeMvVupqsmUZuwVxt` |
| Client secret | 空欄 |
| Scope（欄がある場合） | `openid offline_access momonga:read` |

警告の内容を読み、**「I understand and want to continue」→「Create as a plugin」**を押します。
モモンガにログインして接続を許可し、ツール一覧が表示されることを確認してください。

作成したプラグインを入れ、新しいチャットで **`@`** から選びます。「使ってみる」の検索例を送って試せます。

「Add custom MCP server」が見つからない場合は、組織の管理者に利用できるか確認してください。


## 更新する

プラグイン画面に「更新」が表示されたら押し、新しいチャットを開いてください。組織で配布している版の更新は管理者に依頼します。

WebのカスタムMCPは、プラグインの詳細にある **「Refresh」**でツール情報を更新できます。

[OpenAI公式：カスタムMCPの追加](https://developers.openai.com/plugins/deploy/connect-chatgpt)
