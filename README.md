# モモンガサーチ

法人向けのモモンガサーチ公式プラグインです。Claude・Codex・ChatGPTで利用できます。
24種の分析コマンドを含む1種類を提供します。

| プラグイン | ID | 同梱するSkills |
|---|---|---|
| モモンガサーチ | `momonga-search` | 24種の分析コマンド |

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
| 各プラグインの `.codex-plugin/plugin.json` | デスクトップ向けマニフェスト、MCP接続、OAuth設定 |
| 各プラグインの `.claude-plugin/plugin.json` | Claude向けSkillsのみの設定 |
| 各プラグインの `skills/` | 全ホストで共有するSkills |

Codex向けのOAuth設定には、登録済みのCLI用公開client IDと固定の戻り先ポート18780を含みます。
デスクトップアプリの「設定」→「MCPサーバー」から `momonga` の「認証／Authenticate」を押してください。
ClaudeはChat側でコネクタを登録・認証し、同じアカウント・組織のDesktop Codeがその接続を共用します。
Claude向けプラグインは24種のSkillsだけを含みます。設定は[Claudeの手順](docs/claude.md)を参照してください。
APIキー、client secret、アクセストークンは含みません。
分析手順の本体はサーバーから取得します。サーバー実装や利用者データは含みません。

## 検証範囲

0.2.2のClaude構成は、個人ProとTeamそれぞれのChat・Desktop Codeでファクトシートの実行と表示を確認しています（Desktop 3.6556.2、Code 2.1.308）。CodeのMomonga呼び出しは共有コネクタ1経路でした。個人Codeではプラグインのオフ→オンと新規セッション開始が必要でした。24コマンドすべての検証ではありません。


0.1.8では、現在のデスクトップアプリが対応するCodex形式に変更しています。
アプリ内蔵版0.163.0-alpha.10.2でMCPサーバー1件・25 Skillsの認識と、
登録済みclient ID・戻り先・scopeを使ったOAuth開始、Momongaログイン画面への遷移を確認しています。
ログイン・同意の完了から検索結果取得までの実機確認は未完了です。
過去の接続画面・更新確認は[確認資料](docs/sources.md)に記録しています。

形式の仕様：[OpenAIプラグインのパッケージング](https://developers.openai.com/plugins/build/plugins)。
