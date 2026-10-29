# モモンガサーチ

モモンガサーチの公式プラグイン配布元です。24種類の分析コマンドを使えます。

- Claude：Skillsのみのプラグインと、Chat・Codeで共有するコネクタを使います。
- ChatGPT：各利用者が自分のアカウントでモモンガサーチのMCP接続
  （`https://mcp.momongasearch.com/mcp`）を登録して使います。スキルなしでも動きます。
  検証用に、接続を含まないスキルだけのプラグイン `plugins/chatgpt/momonga-search-chatgpt` を置いています。
  ChatGPTでの導入・動作は未確認のため、案内はしていません。
- OpenAIデスクトップ版：24スキルとMCP接続設定を1個の `momonga-search` に同梱します。
  各利用者が自分のモモンガアカウントで認証します。公開Client IDはアプリの識別子であり、
  個人の接続・アクセストークン・Client Secretは配布物に含めません。

## OpenAI版 0.3.2 の確認

Codexアプリのプラグイン画面で、このリポジトリを更新してください。
未登録なら「追加」→「マーケットプレイスを追加」で
`https://github.com/yozora-finance/momonga-plugins`、Git ref `main` を指定します。
「モモンガサーチ」が **0.3.2** になったことを確認し、接続が必要ならログインします。
新しいチャットでプラグインを指定し、「新着でトヨタ（7203）を調べて」で確認します。

**通常ChatとCodexの両方での実機確認は未完了**です。Web版は対象に含めていません。

導入手順、コマンド一覧、困ったときの対処：

- [導入手順](https://momongasearch.com/user-guide/setup)
- [コマンド一覧](https://momongasearch.com/skills#list)
- [困ったとき](https://momongasearch.com/user-guide/troubleshooting)

## 配布する人向け

`plugins/momonga-search/skills`（Claude版）と `plugins/commands.json` は共通の入力で、手で編集しません。
`.github/generate.py` がそこからCodex版・ChatGPT版を生成し、末尾にホストごとの更新確認だけを付けます。
分析手順は毎回 `start_command` の応答から取得します。

OpenAI版は `plugins/codex/momonga-search` の `.codex-plugin/plugin.json` から
`.mcp.json` と `skills/` を読み込みます。配布先アカウントのアプリIDは必要ありません。
OAuthは既存の公開デスクトップクライアントを使い、ループバックのポート18780で認証します。
配布物にアプリ・コネクタのID（`asdk_app_` など）や `.app.json` を入れることは検査で禁止しています。

```sh
python3 .github/generate.py --check
python3 .github/check-manifests.py
python3 .github/test-package.py
node --test .github/test-refresh.cjs
```

### スキルの更新確認

`start_command` の応答には、サーバーが要求するスキルの版 `required_skill_revision` が入ります。
スキルは自分の版と比べ、要求の方が新しいときだけ更新を案内します。

- Codex：同梱の `scripts/refresh.sh` が、デスクトップアプリ同梱のCodex CLIで
  `codex plugin marketplace upgrade momonga` を実行し、GitHubの版が要求を満たすこと、
  インストール済みのプラグインがその内容と一致すること、新しいスキルが有効なことを確かめてから
  新しいSKILL.mdの場所を返します。満たさなければ理由を出して失敗し、手動更新を案内します。
  実行の許可を求められて拒否した場合も、手動更新の案内で止まります。
  macOSのデスクトップアプリが必要です（CLI単体は未対応）。0.3.1以前にはこの仕組みがないため、
  0.3.2へは一度プラグイン画面から手動で更新してください。
- ChatGPT：スキルはファイルを更新できないため、最新版への入れ替えを案内して止まります。
  接続の「更新」（Refresh）はツール定義を取り込み直す操作で、スキルは更新されません。

[OpenAI公式のプラグイン構成](https://developers.openai.com/plugins/build/plugins)・
[プラグイン同梱MCPのOAuth設定](https://learn.chatgpt.com/docs/extend/mcp#plugin-provided-mcp-servers)
