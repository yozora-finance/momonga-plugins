# モモンガサーチ

モモンガサーチの公式プラグイン配布元です。24種類の分析コマンドを使えます。

- Claude：Skillsのみのプラグインと、Chat・Codeで共有するコネクタを使います。
- ChatGPT・Codex：同じプラグインに24スキルと登録済みMCPアプリへの参照をまとめています。
  接続はプラグイン内で認証します。

導入手順、コマンド一覧、困ったときの対処は、ご利用ガイドをご覧ください。

- [導入手順](https://momongasearch.com/user-guide/setup)
- [コマンド一覧](https://momongasearch.com/skills#list)
- [困ったとき](https://momongasearch.com/user-guide/troubleshooting)

## 配布する人向け

生成元は `yozora-platform/apps/momonga-skills/distribution/generate.ts` です。
共通パッケージは `plugins/codex/momonga-search` にあり、`.app.json` でChatGPTの接続を参照します。
現在の参照先はGPT・Codexで動作確認済みの開発登録です。正式公開・他アカウントへの配布には、
対象へ配布可能な登録と、そのアカウントでの認証・検索確認が必要です。

クラウド版を更新するときは、登録済みプラグインからダウンロードしたZIPを指定します。
技術名を維持し、生成元と登録済みアプリのIDが一致することを検証してアップロードZIPを作ります。

```sh
python3 .github/check-manifests.py
python3 .github/package-openai.py /path/to/registered-plugin.zip /tmp/momonga-openai.zip
```

作ったZIPをChatGPTの同じプラグインの「新しいバージョンをアップロード」から登録します。
Gitへのpushだけではクラウド版は更新されません。分析手順は毎回サーバーから取得し、
パッケージ本体はホストのプラグイン更新・組織配布で更新します。更新の反映時間は未検証です。
