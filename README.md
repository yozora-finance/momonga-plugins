# モモンガサーチ

法人向けのモモンガサーチ公式プラグインです。Claude・Codex・ChatGPTで利用できます。
共通検索Skillと24種の分析コマンドを含む1種類を提供します。

| プラグイン | ID | 同梱するSkills |
|---|---|---|
| モモンガサーチ | `momonga-search-skills` | 共通検索Skill＋24種の分析コマンド |

法人のお試し・有料契約に基づいて利用します。個人向けリモートMCPは提供していません。
サーバー側の利用権限は、所属法人の契約に従います。
接続ごとのSkills追加許可は不要です。

## 接続・利用方法

法人のお試し・有料契約の利用者向けの手順です。会社のワークスペースから導入する場合と、導入担当者の案内で各自追加する場合を説明しています。

- [法人利用者向け：ChatGPT・Codexへ直接追加](docs/direct-install.md)
- [管理者の初回設定：配布・利用許可・更新](docs/administrators.md)
- [Claude（Web・Desktop）](docs/claude.md)
- [利用者向け：ChatGPT・Codex（デスクトップ）](docs/chatgpt.md)
- [24種のコマンド一覧](docs/commands.md)
- [トラブルシューティング](docs/troubleshooting.md)

ChatGPTワークスペースにこのリポジトリを取り込む方式はDesktop onlyです。ChatGPT Webへの配布は現在の手順に含みません。

## パッケージと認証

| ファイル | 用途 |
|---|---|
| `.agents/plugins/marketplace.json` | ChatGPT・Codex向けカタログ |
| `.claude-plugin/marketplace.json` | Claude向けカタログ |
| 各プラグインの `plugin.json` / `mcp.json` | Agent Plugins形式のマニフェストとOpenAI向けOAuth設定 |
| 各プラグインの `.claude-plugin/plugin.json` / `.mcp.json` | Claude向け設定 |
| 各プラグインの `skills/` | 全ホストで共有するSkills |

OpenAI向けのOAuth設定には、登録済みのChatGPT用公開client IDのみを含みます。
Claude向けの `.mcp.json` はMCP URLだけを含みます。Claude Chat・Desktop・Claude Codeは、
それぞれClaudeが公開しているclient IDでログインします（Client ID Metadata Document）。
APIキー、client secret、アクセストークンは含みません。
分析手順の本体はサーバーから取得します。サーバー実装や利用者データは含みません。

## 検証範囲

0.1.6では両カタログの1本化、表示名、25 Skillsの同梱、Claudeマニフェストを検証しています。
過去の接続画面・更新確認は[確認資料](docs/sources.md)に記録しています。
ChatGPT・CodexでのOAuth完了から検索結果取得までの実機確認は未完了です。

形式の仕様：[OpenAIプラグインのパッケージング](https://developers.openai.com/plugins/build/plugins)。
