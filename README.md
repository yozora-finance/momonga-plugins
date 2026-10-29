# モモンガサーチ

モモンガサーチの公式プラグイン配布元です。24種類の分析コマンドを使えます。

- Claude：Skillsのみのプラグインと、Chat・Codeで共有するコネクタを使います。
- Codex向けGitHub版：24スキルとMCP接続設定を1個の `momonga-search` に同梱します。
  各利用者が自分のモモンガアカウントで認証します。公開Client IDはアプリの識別子であり、
  個人の接続・アクセストークン・Client Secretは配布物に含めません。

## ChatGPT通常ChatとCodexで同じ接続を使う

[利用者自身の接続に24スキルをまとめる手順](docs/openai-user-connection.md)を使います。
ChatGPTに登録した本人の接続を参照し、その同じプラグインへスキルを追加する方式です。
本人用ZIPはローカルで生成し、公開リポジトリには個人の接続IDを置きません。
初回の接続登録とZIP更新が必要で、GitHubインストールだけの自動接続ではありません。
別アカウントでの新規登録からの確認は未完了です。

**GitHub版0.3.1の直接MCP設定は、通常Chatでは使えないことが利用者の確認で分かりました。**
Codexでは使用できますが、両対応版として扱わないでください。
通常Chatにも対応させる場合は上記の登録済み接続を使う手順で準備します。

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
