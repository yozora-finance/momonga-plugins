# Momonga by Yozora Finance

Claude・Codex・ChatGPT向けのモモンガサーチ公式プラグインです。
同じ検索Skillを共有し、分析コマンドの有無で選べます。

| プラグイン | ID | 同梱するSkills |
|---|---|---|
| モモンガサーチ | `momonga-search` | 共通検索Skill |
| モモンガサーチ＋スキル | `momonga-search-skills` | 共通検索Skill＋24種の分析コマンド |

**どちらか一方をインストールしてください。** 両方とも同じモモンガMCPに接続します。
共通Skill `momonga-search` は両方に同一内容で収録しています。
サーバー側の利用権限は、ログインした本人・法人の契約に従います。
接続ごとのSkills追加許可は不要です。

## 画像付きの接続・利用ガイド

**[はじめての方はこちら](docs/README.md)** — 認証から最初の検索まで、アプリ別に案内します。

[Claude Web](docs/claude-web.md) · [Claude Desktop](docs/claude-desktop.md) · [Codex](docs/codex.md) · [ChatGPT](docs/chatgpt.md)

[24種のコマンド一覧](docs/commands.md) · [トラブルシューティング](docs/troubleshooting.md)

## Codex

Codex CLIでマーケットプレイスを登録し、プラグインをインストールします。

```sh
codex plugin marketplace add yozora-finance/momonga-plugins --ref main
codex plugin add momonga-search-skills@momonga
```

通常版を使う場合は、2行目を次に置き換えます。

```sh
codex plugin add momonga-search@momonga
```

CodexデスクトップではPlugins Directoryで `Momonga by Yozora Finance` を選び、
インストールしたプラグインの接続設定からモモンガへのOAuthログインを完了します。
カタログが表示されなければアプリを再起動してください。
新規チャットでプラグインまたはSkillを選択し、例えば「トヨタ自動車（7203）の直近決算を出典付きで調べて」と依頼します。

カタログ更新：

```sh
codex plugin marketplace upgrade momonga
```

## ChatGPT

### デスクトップのWork / Codex

上記のマーケットプレイスを登録した環境で、Plugins Directoryから
`Momonga by Yozora Finance` を選び、どちらか一方をインストールします。
モモンガへのOAuthログイン後、新規チャットでプラグインを選択します。
共通検索Skillと、スキル付き版の分析SkillはClaude・Codexと同じファイルです。

### Web版・公開ディレクトリ

GitHubへの公開だけではChatGPTの公開ディレクトリに掲載されません。
このリポジトリはAgent Plugins形式の配布パッケージを提供します。
公開ディレクトリからの一般向け導入には、OpenAIへの提出・審査が別途必要です。
Gitリポジトリからのプラグイン導入は、利用するChatGPT画面の対応状況に依存します。

カスタムMCP接続を作成できる環境では、以下を使用できます。

- MCP URL: `https://mcp.momongasearch.com/mcp`
- OAuth client ID: `pwPehWbWGeAMiRSKeMvVupqsmUZuwVxt`
- Client secret: なし（公開クライアント、PKCE）
- Scope: `openid offline_access momonga:read`
- 登録済みコールバック: `https://chatgpt.com/connector_platform_oauth_redirect`

MCP接続だけを追加しても、このリポジトリのSkillsはインストールされません。
Skillsも利用する場合は、プラグインを導入できる画面を使ってください。

## Claude Chat / Desktop

1. 「カスタマイズ」→「プラグイン」→「プラグインを追加」→「マーケットプレイスを追加」を開きます。
2. `https://github.com/yozora-finance/momonga-plugins` を登録します。
3. どちらか一方をインストールし、モモンガへのログインを完了します。
4. スキル付き版では新規チャットで `/` を入力し、`factsheet` などを選びます。

例：`/factsheet トヨタ自動車（7203）`

ZIPから導入した旧 `Momonga commands` はリポジトリ版へ自動移行しません。
リポジトリ版への移行後は旧版を無効にして、重複を避けてください。

## Claude Code

```text
/plugin marketplace add yozora-finance/momonga-plugins
/plugin install momonga-search-skills@momonga
```

通常版は `/plugin install momonga-search@momonga` を使用します。
ログインは `/mcp` から行います。
分析コマンド例：`/momonga-search-skills:factsheet トヨタ自動車（7203）`。
更新は `/plugin marketplace update momonga` から行います。

## パッケージと認証

| ファイル | 用途 |
|---|---|
| `.agents/plugins/marketplace.json` | Codex・ChatGPT向けカタログ |
| `.claude-plugin/marketplace.json` | Claude向けカタログ |
| 各プラグインの `plugin.json` / `mcp.json` | Agent Plugins形式のマニフェストとOpenAI向けOAuth設定 |
| 各プラグインの `.claude-plugin/plugin.json` / `.mcp.json` | Claude向け設定 |
| 各プラグインの `skills/` | 全ホストで共有するSkills |

OAuth設定には登録済みの公開client IDのみを含みます。
OpenAIのクラウド接続にはChatGPT用クライアント、Claudeのローカル接続にはCLI用クライアントを使用します。
ローカルCLI独自のOAuthフローを使う場合は、そのクライアントのコールバックに合う接続設定が必要です。
APIキー、client secret、アクセストークンは含みません。
分析手順の本体はサーバーから取得します。サーバー実装や利用者データは含みません。

## 検証範囲

0.1.3ではClaudeのマニフェスト検証、Codex CLIでのカタログ登録・プラグインインストール、
共通Skillの一致と同梱数（通常版1、スキル付き版25）を確認しています。
Codex・ChatGPTでのOAuth完了から検索結果取得までの実機確認は未完了です。

形式の仕様：[OpenAIプラグインのパッケージング](https://developers.openai.com/plugins/build/plugins)。
