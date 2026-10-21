# Codex

[使い方のトップ](README.md)

## プラグインを入れる

Codexの新しいチャットに、次をそのまま貼り付けてください。

```text
モモンガサーチのプラグインを入れてください。
codex と git が使えるか確認し、なければ公式の導入手順を案内してください。
使えるようになったら、次の2行を実行してください。

codex plugin marketplace add yozora-finance/momonga-plugins --ref main
codex plugin add momonga-search-skills@momonga

終わったら、プラグイン画面からモモンガに接続する場所を教えてください。
ログインと接続の許可は自分で行います。
```

実行が終わったら、アプリの **「プラグイン」→「ディレクトリ」**を開きます。
**「Momonga by Yozora Finance」**の **「モモンガサーチ＋スキル」**を開いてください。
見つからない場合は、アプリを再起動します。

<details>
<summary>自分でターミナルから入れる場合</summary>

[公式手順](https://learn.chatgpt.com/docs/codex/cli)でCodex CLIを用意し、次を実行します。

```sh
codex plugin marketplace add yozora-finance/momonga-plugins --ref main
codex plugin add momonga-search-skills@momonga
```

検索のみの版を使う場合は、2行目を `codex plugin add momonga-search@momonga` に変えます。

</details>

## モモンガにログインする

プラグインの接続設定で **「Connect／接続」**を押します。
ブラウザが開いたらモモンガにログインし、接続の許可を済ませてCodexに戻ります。

インストール後も「接続」が残っている場合は、この操作が必要です。

## 使ってみる

新しいチャットの入力欄で **`@`** を打ち、モモンガを選んで次を送ります。

```text
トヨタ自動車（7203）の直近決算を出典付きで調べて。
```

ツールの使用を確認されたら、内容を見て許可します。モモンガの検索結果と出典が返ってくることを確かめてください。
分析するときも、`@` の候補から `factsheet` などを選び、会社名を続けます。

## 更新する

Codexに次の実行を頼んでください。

```sh
codex plugin marketplace upgrade momonga
```

プラグイン画面に「更新」が出たら押します。更新後は新しいチャットを使ってください。

[コマンド一覧](commands.md) ／ [困ったとき](troubleshooting.md)

※ここではデスクトップでの接続方法を案内しています。CLIだけでの認証は未確認です。
