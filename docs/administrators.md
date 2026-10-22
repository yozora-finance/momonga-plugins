# 管理者の初回設定

[使い方のトップ](README.md)

導入先企業のClaude組織、またはChatGPTワークスペースの管理者向けです。プラグインを社員が使える状態にし、各社員には接続手順を案内します。モモンガへのログインは社員それぞれが行います。

## Codex・ChatGPT

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

取り込んだ **「モモンガサーチ＋スキル」** を開き、対象の役割に対する **Installation policy** を設定します。

- **Available**：社員が一覧からインストールします。
- **Installed**：対象社員にインストールする設定です。

必要なアプリがある場合は、その利用権限も確認してください。リポジトリに書かれたインストール・認証ポリシーは、ワークスペースへの取り込みでは適用されません。管理画面で設定します。

社員に [Codex・ChatGPTの接続手順](chatgpt.md) を案内し、デスクトップの **Plugins → ワークスペース名** にプラグインが表示されることを確認してください。管理者のGitHub連携で、社員のモモンガ認証まで済むわけではありません。

### 利用できるアプリ

現在のパッケージにはMCP接続設定が含まれるため、この取り込み方式では **Desktop only** になります。社員にはCodex・ChatGPTのデスクトップで利用するよう案内してください。

ChatGPT Webで同じプラグインを使うには、登録済みアプリを `.app.json` で参照する構成など、配布側の対応が必要です。現在のリポジトリを取り込むだけではWeb対応になりません。

### 更新する

新しく登録したマーケットプレイスは毎日自動同期されます。すぐに反映したい場合は **Admin → Plugins → Marketplaces** で対象を開き、**Sync now** を押します。

同期後は結果を確認してください。エラーになったプラグインは直前の動作する版が保持されます。更新が反映されたら、社員には新しいチャットを開いてもらいます。

[OpenAI公式：マーケットプレイスの取り込み・同期・利用制限](https://learn.chatgpt.com/docs/enterprise/plugin-management)

## Claude（Web・Desktop）

### 公開リポジトリを社員が追加する場合

このリポジトリは公開マーケットプレイスとして社員が追加できます。組織で追加元を制限している場合は、管理者が利用可能な配布元か確認し、[Claudeの接続手順](claude.md)を案内してください。

### 組織でまとめて配布・同期する場合

Claude Team／EnterpriseのOwnerまたはPrimary Ownerが設定します。Enterpriseでは、組織ライブラリを管理する権限を持つ役割でも設定できます。組織でCoworkとSkillsの両方が有効になっている必要があります。

**Claudeの組織向けGitHub同期は、github.com上のprivate/internalリポジトリが対象です。この公開リポジトリをそのまま組織の同期元にはできません。** 組織配布が必要な場合は、社内のprivate/internalリポジトリにカタログを用意する構成を導入担当者と決めてください。公開元の更新をどう反映するかも、その際に決めます。

社内の同期元を用意したら、**Organization settings → Plugins & skills → Marketplaces → Add plugins → Sync from GitHub** で登録します。対象リポジトリにはClaude GitHub Appのインストールが必要です。取り込み後に配布対象と利用設定を確認し、社員に[Claudeの接続手順](claude.md)を案内してください。

更新は対象マーケットプレイスの **Re-sync** から確認できます。自動同期の条件とGitHub権限は公式資料を参照してください。

[Claude公式：組織への配布とGitHub同期](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization)
