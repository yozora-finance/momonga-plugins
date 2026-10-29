# 利用者自身のChatGPT接続に24スキルをまとめる

## 方式

ChatGPTに登録したMCP接続への参照と24スキルを、同じ登録済みプラグインにまとめます。
通常Chat・Codexで成功したのはこの接続経路です。GitHub版0.3.1の直接MCP設定は
Codexで使えても通常Chatでは使えなかったため、この手順には使いません。

各利用者が作成した接続のZIPを入力にして、本人用の更新ZIPを生成します。
個人のアプリIDは公開リポジトリに置きません。生成物は本人用なので他人へ配布しません。
公開するのは24スキルと生成ツールです。完成する登録済みプラグインは1個です。

この方式には初回のChatGPT接続登録とZIP更新が必要です。
GitHub版をインストールするだけで接続を自動作成する方式ではありません。
別アカウントによる新規登録からの確認は未完了です。

## 1. 自分のモモンガ接続を用意する

既に通常Chat・Codexで動いた登録済みモモンガがあれば再利用します。
新規ならChatGPTのプラグイン画面で「追加」→「カスタムMCPサーバーを追加」を選びます。

- 表示名：モモンガサーチ
- MCP URL：`https://mcp.momongasearch.com/mcp`
- 認証：OAuth、ユーザー定義の事前登録済みクライアント
- 公開Client ID：`pwPehWbWGeAMiRSKeMvVupqsmUZuwVxt`
- トークン認証：`none`、Client Secretは空欄
- Authorization URL：`https://auth.momongasearch.com/oauth2/authorize`
- Token URL：`https://auth.momongasearch.com/oauth2/token`
- Callback：`https://chatgpt.com/connector_platform_oauth_redirect`
- スコープ：`openid momonga:read offline_access`
- OIDCの自動追加スコープ `email profile` は無効

公開Client IDはChatGPT用アプリの識別子であり、個人の接続IDや秘密鍵ではありません。
Codex用のループバックClient IDをここで使わないでください。
自分のモモンガアカウントで認証し、接続先法人を確認します。

## 2. 自分の登録済みZIPへスキルをまとめる

作成したプラグインからZIPをダウンロードします。配布リポジトリのcheckoutで実行します。

```sh
python3 .github/bind-openai.py \
  /path/to/my-registered-plugin.zip \
  /tmp/momonga-search-my-account.zip \
  --version 1.0.2
```

`--version` は自分の現在の登録版より新しい値を指定します。
ツールは入力ZIPの技術名と接続IDを維持し、表示名を「モモンガサーチ」として24スキルを追加します。
入力ZIPは上書きせず、本人用の出力を公開リポジトリ内へ作成することも拒否します。
登録済みZIPがモモンガのものかは、ダウンロード元の画面で確認してください。
ZIPには認証token・Client Secretを追加しません。

## 3. 同じプラグインを更新して確認する

ダウンロード元の同じ登録済みプラグインを開き、「新しいバージョンをアップロード」で
生成したZIPを指定します。別のテストプラグインを追加する操作ではありません。
既存の接続が有効ならその接続を使います。再認証が求められたら本人のアカウントで接続します。

通常ChatとCodexそれぞれの新しい会話で、更新したモモンガサーチを指定し、
「新着でトヨタ（7203）を調べて」と送ります。スキルが読まれるだけでなく、
`start_command` と実検索が実行されることを確認してください。

以後のスキル更新も、本人の登録済みZIPから新しい版を生成して同じプラグインへアップロードします。
GitHub版0.3.1の更新だけでは、この登録済みプラグインのスキルは更新されません。

[公式の登録済みMCPとスキルの組み合わせ](https://developers.openai.com/plugins/build/plugins#create-and-test-a-plugin-locally-with-an-mcp-server)
