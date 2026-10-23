# 管理者の初回設定

[使い方のトップ](README.md)

導入先企業のClaude組織、またはChatGPTワークスペースの管理者向けです。プラグインを社員が使える状態にし、各社員には接続手順を案内します。モモンガへのログインは社員それぞれが行います。

配布元は公開リポジトリ `https://github.com/yozora-finance/momonga-plugins` です。

| 利用先 | 管理者が行うこと | 社員が行うこと |
|---|---|---|
| Claude | 公開マーケットプレイスの利用を許可し、接続手順を案内 | 公開URLから追加して認証 |
| ChatGPT・Codex | 公開リポジトリを取り込み、社員に配布 | 会社の一覧からインストールして認証 |

## 案内するプラグイン

「モモンガサーチ」（内部ID：`momonga-search`）を案内してください。24種の分析コマンドを含む1種類です。法人のお試し・有料契約に紐づく利用アカウントが必要です。

## ChatGPT・Codex

### 1. GitHubマーケットプレイスを取り込む

ChatGPTワークスペースの管理者アカウントで **Admin → Plugins → Add → Import marketplace** を開きます。

| 欄 | 入力値 |
|---|---|
| Source | `https://github.com/yozora-finance/momonga-plugins` |
| Path | 空欄 |
| Branch, tag, or commit | `main` |

**Import marketplace** を押し、求められたらGitHubへのアクセスを許可します。GitHubアカウントには対象リポジトリの読み取り権限が必要です。

**Import results** で取り込み結果を確認します。リポジトリ直下の `.agents/plugins/marketplace.json` がカタログです。Path欄にこのファイル名を入れる必要はありません。

### 2. 社員に利用を許可する

取り込んだ「モモンガサーチ」を開き、対象の役割に対する **Installation policy** を設定します。

- **Available** ：社員が一覧からインストールします。
- **Installed** ：対象社員にインストールする設定です。

必要なアプリがある場合は、その利用権限も確認してください。リポジトリに書かれたインストール・認証ポリシーは、ワークスペースへの取り込みでは適用されません。管理画面で設定します。

社員に [ChatGPT・Codexの接続手順](chatgpt.md) を案内し、デスクトップの **Plugins → ワークスペース名** にプラグインが表示されることを確認してください。

### 利用できるアプリ

現在のパッケージにはMCP接続設定が含まれるため、この取り込み方式では **Desktop only** になります。社員にはChatGPT・Codexのデスクトップで利用するよう案内してください。

ChatGPT Webで同じプラグインを使うには、登録済みアプリを `.app.json` で参照する構成など、配布側の対応が必要です。現在のリポジトリを取り込むだけではWeb対応になりません。

### 更新する

新しく登録したマーケットプレイスは毎日自動同期されます。すぐに反映したい場合は **Admin → Plugins → Marketplaces** で対象を開き、 **Sync now** を押します。

同期後は結果を確認してください。エラーになったプラグインは直前の動作する版が保持されます。更新が反映されたら、社員には新しいチャットを開いてもらいます。

[OpenAI公式：マーケットプレイスの取り込み・同期・利用制限](https://learn.chatgpt.com/docs/enterprise/plugin-management)

## Claude（Web・Desktop）

### 1. 公開マーケットプレイスの利用を確認する

組織で追加できるマーケットプレイスを制限している場合は、この公開リポジトリを利用できる設定か確認してください。

```text
https://github.com/yozora-finance/momonga-plugins
```

### 2. Chat側に共通コネクタを追加する

管理者がChat側の「カスタマイズ」→「コネクタ」から、名前「モモンガサーチ」、URL `https://mcp.momongasearch.com/mcp` のカスタムコネクタを登録します。同じ接続先が登録済みなら、その接続を使います。各社員は自分のアカウントで「連携させる」から認証します。Desktop Codeは同じ組織の接続を共用します。

### 3. 社員に接続手順を案内する

[Claudeの接続手順](claude.md)を案内してください。社員が **カスタマイズ → プラグイン → ＋追加 → マーケットプレイスを追加 → リポジトリから追加** で公開URLを登録し、「モモンガサーチ」を追加します。

この公開リポジトリを使う手順では、社員ごとにマーケットプレイスを追加します。管理画面の組織向け **Sync from GitHub** は公開リポジトリを受け付けないため、使いません。

[Claude公式：公開リポジトリからの追加](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) ／ [組織向け同期の対象](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization)
