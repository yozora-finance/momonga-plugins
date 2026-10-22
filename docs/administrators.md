# 管理者向け：プラグインを配布する

[使い方のトップ](README.md)

利用者が画面から追加できるよう、組織の管理者が先に設定します。

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


[OpenAI公式：組織への取り込み](https://learn.chatgpt.com/docs/enterprise/plugin-management)
