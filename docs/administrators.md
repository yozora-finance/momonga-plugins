# 管理者の初回設定

[トップ](../README.md)

企業のClaude組織、またはChatGPTワークスペースの管理者向け手順書です。社員がプラグインを使えるよう環境を整え、接続手順を案内します。モモンガへのログインは社員各自が行います。

配布元は公開リポジトリ `https://github.com/yozora-finance/momonga-plugins` です。

| 利用先 | 管理者が行うこと | 社員が行うこと |
|---|---|---|
| Claude | 公開マーケットプレイスの利用を許可し、接続手順を案内 | 公開URLから追加して認証 |
| ChatGPT・Codex | 公開リポジトリを取り込み、社員に配布 | 会社の一覧からインストールして認証 |

## 案内するプラグイン

「モモンガサーチ」（内部ID：`momonga-search`）を案内してください。24種類の分析コマンドを備えた1種類のプラグインです。利用には法人のお試し・有料契約に紐づくアカウントが必要です。

## ChatGPT・Codex

### 1. GitHubマーケットプレイスを取り込む

ChatGPTワークスペースの管理者アカウントで **Admin → Plugins → Add → Import marketplace** を開きます。

| 欄 | 入力値 |
|---|---|
| Source | `https://github.com/yozora-finance/momonga-plugins` |
| Path | 空欄 |
| Branch, tag, or commit | `main` |

**Import marketplace** を押し、求められたらGitHubへのアクセスを許可します。GitHubアカウントには対象リポジトリの読み取り権限が必要です。

**Import results** で取り込み結果を確認します。リポジトリ直下の `.agents/plugins/marketplace.json` がカタログです。Path欄は空欄のまま進めてください。

### 2. 社員に利用を許可する

取り込んだ「モモンガサーチ」を開き、対象の役割に対する **Installation policy** を設定します。

- **Available** ：社員が一覧から各自でインストールします。
- **Installed** ：対象社員にインストールする設定です。

必要なアプリがある場合は、その利用権限も確認してください。ワークスペースへの取り込み時は、リポジトリに書かれたインストール・認証ポリシーにかかわらず、管理画面でポリシーを設定します。

社員に [ChatGPT・Codexでの導入手順](chatgpt.md) を案内し、デスクトップアプリの **Plugins → ワークスペース名** にプラグインが表示されることを確認してください。

### 利用できるアプリ

現在のパッケージにはMCP接続設定が含まれるため、この取り込み方式では **Desktop only**（デスクトップアプリ専用）となります。社員にはChatGPT・Codexのデスクトップアプリで利用するよう案内してください。

### 更新する

新しく登録したマーケットプレイスは毎日自動で同期されます。手動ですぐ反映する場合は **Admin → Plugins → Marketplaces** で対象を開き、 **Sync now** を押します。

同期後は結果を確認してください。エラーが発生したプラグインは、直前の正常なバージョンが保持されます。更新が反映されたら、社員に新しいチャットを開くよう案内してください。

[OpenAI公式：マーケットプレイスの取り込み・同期・利用制限](https://learn.chatgpt.com/docs/enterprise/plugin-management)

## Claude（Web・Desktop）

### 1. 公開マーケットプレイスの利用を確認する

組織で追加できるマーケットプレイスを制限している場合は、この公開リポジトリを利用できる設定か確認してください。

```text
https://github.com/yozora-finance/momonga-plugins
```

### 2. Chatに共通コネクタを追加する

管理者がChatの「カスタマイズ」→「コネクタ」から、名前「モモンガサーチ」、URL `https://mcp.momongasearch.com/mcp` のカスタムコネクタを登録します。同じ接続先が登録済みの場合は、その接続を使います。各社員は自分のアカウントで「連携させる」を押して認証します。Codeでも同じ組織の接続が使われます。

### 3. 社員に接続手順を案内する

社員に [Claudeでの導入手順](claude.md) を案内してください。社員各自が **カスタマイズ → プラグイン → ＋追加 → マーケットプレイスを追加 → リポジトリから追加** で公開URLを登録し、「モモンガサーチ」を追加します。

組織向けの **Sync from GitHub** には公開リポジトリを登録できないため、マーケットプレイスは社員が各自で追加します。

[Claude公式：公開リポジトリからの追加](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) ／ [組織向け同期の対象](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization)
