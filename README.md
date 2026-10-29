# モモンガサーチ

モモンガサーチの公式プラグイン配布元です。24種類の分析コマンドを使えます。

- Claude：Skillsのみのプラグインと、Chat・Codeで共有するコネクタを使います。
- ChatGPTの通常Chat：スキルだけのパッケージ `plugins/chatgpt/momonga-search-chatgpt` を用意しています。
  接続は含みません。各利用者が自分のアカウントでモモンガサーチのMCP接続
  （`https://mcp.momongasearch.com/mcp`）を登録して使います。このパッケージの通常Chatでの実機確認は未完了です。
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

生成元は `yozora-platform/apps/momonga-skills/distribution/generate.ts` です。
このリポジトリでは `plugins/momonga-search/skills`（Claude版）を共通の薄いスキルとし、
`.github/generate.py` がCodex版とChatGPT版を生成します。各スキルの本文は共通で、
末尾にホストごとの更新確認だけを付けます。分析手順は毎回 `start_command` の応答から取得します。

OpenAI版は `plugins/codex/momonga-search` の `.codex-plugin/plugin.json` から
`.mcp.json` と `skills/` を読み込みます。配布先アカウントのアプリIDは必要ありません。
OAuthは既存の公開デスクトップクライアントを使い、ループバックのポート18780で認証します。
配布物にアプリ・コネクタのID（`asdk_app_` など）や `.app.json` を入れることは検査で禁止しています。

```sh
python3 .github/generate.py           # 共通スキルからCodex版・ChatGPT版を生成
python3 .github/check-manifests.py
python3 .github/test-package.py
node --test .github/test-refresh.cjs
python3 .github/package-openai.py /tmp/momonga-openai-0.3.2.zip
python3 .github/package-chatgpt.py /tmp/momonga-chatgpt-skills-0.3.2.zip
```

### スキルの更新確認

`start_command` の応答には、サーバーが要求するスキルの版 `required_skill_revision` が入ります。
スキルは自分の版（`release.json` の `revision`）と比べ、要求の方が新しいときだけ更新を案内します。

- Codex：同梱の `scripts/refresh.sh` を実行します。デスクトップアプリ同梱のCodex CLIで
  `codex plugin marketplace upgrade momonga` を実行し（他のマーケットプレイスは更新しません）、
  GitHubの版が要求を満たすこと、インストール済みキャッシュがGitHubの内容と一致すること、
  `skills/list`（`forceReload`）で新しいSKILL.mdが有効なことを確認してから、そのパスを返します。
  どれかを満たさなければ理由を出して失敗し、再試行しません。実行中の会話は新しいSKILL.mdを
  パスで読み直して続けます。macOSのデスクトップアプリ同梱ランタイムが必要です（CLI単体は未対応）。
- ChatGPT：スキルはファイルを更新できないため、パッケージの取り込み直しを案内して止まります。
  接続の「更新」（Refresh）はツール定義を取り込み直す操作で、スキルパッケージは更新されません。

ZIPは同じ配布内容のアーカイブです。個人の登録済みプラグインを更新するZIPではありません。
ChatGPTへのスキルパッケージの取り込み方法と、取り込んだスキルが利用者自身の接続の
`start_command` を呼べるかは未確認です。公開ディレクトリへの掲載申請は行いません。

[OpenAI公式のプラグイン構成](https://developers.openai.com/plugins/build/plugins)・
[プラグイン同梱MCPのOAuth設定](https://learn.chatgpt.com/docs/extend/mcp#plugin-provided-mcp-servers)
