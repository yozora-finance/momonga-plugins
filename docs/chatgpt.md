# ChatGPT

[使い方のトップ](README.md)

## デスクトップで使う

まず、同じPCのCodexでプラグインを入れます。[こちらの依頼文](codex.md#プラグインを入れる)をCodexの新しいチャットに貼り付けてください。

終わったら **「プラグイン」→「ディレクトリ」**を開き、**「Momonga by Yozora Finance」→「モモンガサーチ＋スキル」**を選びます。表示されなければアプリを再起動してください。

プラグインの **「Connect／接続」**を押し、ブラウザでモモンガにログインします。接続を許可したらアプリに戻ります。

新しいチャットで **`@`** を打ってモモンガを選び、次を送ります。

```text
トヨタ自動車（7203）の直近決算を出典付きで調べて。
```

ツール使用の確認に応答し、モモンガから出典付きの結果が返ってくることを確かめてください。

## Webで使う

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

作成したプラグインを入れ、新しいチャットで **`@`** から選びます。上の検索例を送って試せます。

「Add custom MCP server」が見つからない場合は、組織の管理者に利用できるか確認してください。

[コマンド一覧](commands.md) ／ [困ったとき](troubleshooting.md)

<details>
<summary>組織の管理者がまとめて配布する場合</summary>

**Admin → Plugins → Add → Import marketplace**を開きます。

| 欄 | 入力値 |
|---|---|
| Source | `https://github.com/yozora-finance/momonga-plugins` |
| Path | 空欄 |
| Branch, tag, or commit | `main` |

GitHubのアクセスを認証して取り込み、対象メンバーが「モモンガサーチ＋スキル」を使える設定にします。
メンバーはデスクトップの **Plugins → 組織名**から追加し、それぞれモモンガにログインします。

このリポジトリを取り込んだプラグインは **Desktop only** です。Webの検索接続は、上のカスタムMCP手順を使ってください。

更新は **Admin → Plugins → Marketplaces → Sync now**から行います。

</details>

[OpenAI公式：カスタムMCPの追加](https://developers.openai.com/plugins/deploy/connect-chatgpt) ／ [組織への取り込み](https://learn.chatgpt.com/docs/enterprise/plugin-management)
