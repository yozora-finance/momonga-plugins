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

## 接続・利用方法

公開リポジトリを配布元として使います。Claudeは社員がマーケットプレイスのURLを追加し、Codex・ChatGPTは管理者が取り込んで社員に配布します。

- [管理者の初回設定：配布・利用許可・更新](docs/administrators.md)
- [社員向け：Claude（Web・Desktop）](docs/claude.md)
- [社員向け：Codex・ChatGPT（デスクトップ）](docs/chatgpt.md)
- [24種のコマンド一覧](docs/commands.md)
- [困ったとき](docs/troubleshooting.md)

ChatGPTワークスペースにこのリポジトリを取り込む方式はDesktop onlyです。ChatGPT Webへの配布は現在の手順に含みません。

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
