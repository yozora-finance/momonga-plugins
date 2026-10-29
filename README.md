# モモンガサーチ

モモンガサーチの公式プラグイン配布元です。24種類の分析コマンドを使えます。

- Claude：Skillsのみのプラグインと、Chat・Codeで共有するコネクタを使います。
- OpenAIデスクトップ版：24スキルとMCP接続設定を1個の `momonga-search` に同梱します。
  各利用者が自分のモモンガアカウントで認証します。公開Client IDはアプリの識別子であり、
  個人の接続・アクセストークン・Client Secretは配布物に含めません。

## OpenAI版 0.3.1 の確認

Codexアプリのプラグイン画面で、このリポジトリを更新してください。
未登録なら「追加」→「マーケットプレイスを追加」で
`https://github.com/yozora-finance/momonga-plugins`、Git ref `main` を指定します。
「モモンガサーチ」が **0.3.1** になったことを確認し、接続が必要ならログインします。
新しいチャットでプラグインを指定し、「新着でトヨタ（7203）を調べて」で確認します。

この版は個人のテストアプリ参照を廃止した、MCP同梱版です。**通常ChatとCodexの両方での
実機確認は未完了**です。以前の個人アプリ参照版の動作確認は、この版の確認を兼ねません。
Web版は対象に含めていません。通常Chatへの公開範囲はホスト側の制約もあるため、
両方でツール呼び出しを確認するまで両対応の検証済み版とは扱いません。

導入手順、コマンド一覧、困ったときの対処：

- [導入手順](https://momongasearch.com/user-guide/setup)
- [コマンド一覧](https://momongasearch.com/skills#list)
- [困ったとき](https://momongasearch.com/user-guide/troubleshooting)

## 配布する人向け

生成元は `yozora-platform/apps/momonga-skills/distribution/generate.ts` です。
OpenAI版は `plugins/codex/momonga-search` の `.codex-plugin/plugin.json` から
`.mcp.json` と `skills/` を読み込みます。配布先アカウントのアプリIDは必要ありません。
OAuthは既存の公開デスクトップクライアントを使い、ループバックのポート18780で認証します。

```sh
python3 .github/check-manifests.py
python3 .github/test-package.py
python3 .github/package-openai.py /tmp/momonga-openai-0.3.1.zip
```

ZIPは同じ配布内容のアーカイブです。個人の登録済みプラグインを更新するZIPではありません。
GitHub配布物の更新にはホスト側でマーケットプレイス・プラグインを更新します。
公開ディレクトリへの掲載申請や、ChatGPT上の登録済みアプリの更新は行いません。

分析手順は毎回 `start_command` の応答から取得します。今回の変更は接続設定と配布処理で、
薄いSkillsとサーバー要求revision 5は変更していません。

[OpenAI公式のプラグイン構成](https://developers.openai.com/plugins/build/plugins)・
[プラグイン同梱MCPのOAuth設定](https://learn.chatgpt.com/docs/extend/mcp#plugin-provided-mcp-servers)
