# モモンガサーチ 接続・利用マニュアル

## 用意するもの

- ChatGPT または Claude のアカウント。Claude のプラグインは有料プラン（Pro・Max・Team・Enterprise）で使えます。ChatGPT はデスクトップ版のアプリが必要です。
- モモンガサーチの利用アカウント。アカウントがない場合は、モモンガの担当者または社内の導入担当者にお問い合わせください。

## 接続方法を選ぶ

公開リポジトリ `https://github.com/yozora-finance/momonga-plugins` から導入します。個人で追加する場合と、会社のワークスペースから配布される場合で手順が異なります。

## 個人で使う

- [Claude（Web・Desktop）：公開URLから追加](claude.md)
- [Codex・ChatGPTデスクトップ：公開マーケットプレイスを追加](personal.md)

ChatGPT Webには、デスクトップで追加したローカルマーケットプレイスは引き継がれません。

## 会社のワークスペースで使う

- [管理者の初回設定：利用許可・配布・更新](administrators.md)
- [社員向け：Claude（Web・Desktop）](claude.md)
- [社員向け：Codex・ChatGPT（デスクトップ）](chatgpt.md)

Claudeは会社の利用制限を確認したうえで、各社員が公開URLを追加します。Codex・ChatGPTは管理者が公開リポジトリを取り込み、社員が会社の一覧からインストールします。この取り込み方式では現在のパッケージは **Desktop only** になります。

[ログイン・認証について](authentication.md)

プラグインは **「モモンガサーチ＋スキル」** を選ぶと、検索と24種の分析コマンドを使えます。「モモンガサーチ」は検索のみの版です。両方入れる必要はありません。

[コマンド一覧](commands.md) ／ [困ったとき](troubleshooting.md) ／ [更新担当者向けの確認メモ](sources.md)
