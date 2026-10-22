# 確認資料・画像について

[ガイドのトップ](README.md)

画面確認：2026年10月21日。公式の配布仕様を再確認：2026年10月22日。対象：プラグイン 0.1.3。

## 確認したもの

| 対象 | 確認内容 |
|---|---|
| リポジトリのマニフェスト | プラグイン2種、マーケットプレイス名、MCP URL、OpenAI向けOAuth設定 |
| 同梱の Skills | 分析24種の名前・説明、共通検索1種 |
| 公開MCP認証メタデータ | `https://mcp.momongasearch.com/.well-known/oauth-protected-resource/mcp` が示す認証先 `https://auth.momongasearch.com` |
| Claude Desktop の実画面 | マーケットプレイス追加フォーム、スキル付き版0.1.3、25 Skills、momongaの接続済み表示 |

**確認の限界：** このドキュメント作成では新規アカウントでの登録・OAuth初回許可・4アプリそれぞれでの検索完了までの通し試験は行っていません。ChatGPT／CodexのOAuthから検索結果までの実機確認は、リポジトリの既存READMEでも未完了とされています。手順の各末尾に、利用者が確認する完了条件を明記しています。

## デスクトップへ直接追加する画面（確認時の記録）

2026年10月22日、ローカルのChatGPT.app 26.1013.40934（20770）の配布済み実装を読み取り確認しました。

- `hosted-plugin-creation-actions`：追加メニューの「マーケットプレイスを追加」。
- `add-marketplace-dialog`：Source、Git ref、Sparse pathsと追加ボタン。
- `marketplace-add`：入力を `source`、`refName`、`sparsePaths` に変換して登録。
- `plugins-cards-grid`：ローカルホストでplugins機能が有効ならメニューを提供。管理者役割による判定はなく、登録後はPersonalの対象マーケットプレイスへ遷移。

これは実装の確認であり、画面操作・OAuth・検索の通し試験とは区別しています。Webのホスト向け処理にはこのローカル追加操作を渡していません。

## 公式情報

- [Claude：プラグインの利用](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Claude：組織への配布・同期（github.comはprivate/internalのみ）](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization)
- [Claude：リモートMCPの接続と認証](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [OpenAI：Plugins](https://learn.chatgpt.com/docs/plugins)
- [OpenAI：組織のプラグイン取り込み・Desktop onlyの制約](https://learn.chatgpt.com/docs/enterprise/plugin-management)
- [OpenAI：カスタムMCPの追加とテスト](https://developers.openai.com/plugins/deploy/connect-chatgpt)
- [OpenAI：プラグインの配布形式](https://developers.openai.com/plugins/build/plugins)

## 画像

- `claude-plugins.png`、`claude-marketplace.png`、`claude-connected.png`：2026年10月21日に撮影したClaude Desktopの実画面。個人のチャット一覧が写らないよう、サイドバーを閉じて撮影しています。
- Safariで開かれていた参考マニュアルは「短い説明と画像を手順ごとに並べる」構成の参考にしました。旧接続設定・旧コマンド名は転載していません。

## 更新時の確認

コマンドを変更したら `commands.md` を同梱Skillsに合わせて更新します。接続方法を変更したら、本文と認証手順を揃えて確認してください。スクリーンショットを差し替える場合は個人情報と認証情報が写っていないことを確認します。


## ClaudeのGitHub未連携アカウントでの自動更新検証（2026年10月22日）

- 公開元：YozoraにClaude GitHub Appをインストールし、対象をmomonga-pluginsに限定。Appは有効で、push / pull_requestイベント購読をGitHub APIで確認した。
- 通常のリポジトリWebhook一覧は0件。GitHub AppのWebhook配信履歴はApp自身のJWTが必要で、Yozora側の認証では確認できない。配信成功そのものをAPIで確認したとは扱わない。
- 顧客役：別の無料Claudeアカウント。開始前と更新後の両方で、GitHubコネクタは「連携／連携させる」の表示で未連携。
- 公開URLを「自動的に同期」オンで追加。GitHub連携要求は出ず、設定がオンのまま保存された。同期元コミットはb6d426a。
- モモンガサーチ＋スキル0.1.3を追加した後、公開元で両プラグインのマニフェスト4ファイルのversionだけを0.1.4に更新した。検索・認証・コマンド内容は変更していない。
- [検証用リリースPR #2](https://github.com/yozora-finance/momonga-plugins/pull/2)を2026-10-22 14:29:43 JSTにマージ。mainは21927c0252164cf2646f6f3886d8204179c7dd2a。
- 顧客役の「アップデートを確認」「更新」ボタンは一度も押していない。旧画面の表示が残っていたため画面を再読み込みし、「自分のもの」から同じプラグインを開き、0.1.4・25 Skills・有効を確認した。
- 結果：この構成では、公式ディレクトリ掲載も顧客側GitHub連携も行わずに新版を受信できた。今回の観測はバージョン更新の受信までで、全種類の変更に対する承認条件、反映時間の上限、検索・OAuthの通し検証を保証するものではない。無料アカウントで今回の操作が通ったことと、プランの一般的な提供条件は区別する。

## 1本化に伴うガイド更新（2026年10月22日）

0.1.6でコマンドなし版の公開を終了し、共通検索Skill＋24分析コマンドを含む `momonga-search-skills` の表示名を「モモンガサーチ」に統一しました。両マーケットプレイスはこの1種類を掲載します。法人のお試し・有料契約向けとしてガイドを更新しました。

上記の0.1.3・0.1.4の記録と保存画像は検証当時のものです。旧表示名や2種類の記載は当時の状態を示します。今回の文書更新では新たなOAuth・検索の通し試験は行っていません。Cloud Run・アダプタ・認証設定は変更していません。

0.1.7で分析コマンドの名前を日本語にしました（`/新着`、`/ファクトシート` など）。説明の末尾に英語の名前も残しています。Codex向けの `.codex-plugin/plugin.json` を追加し、CodexがモモンガのMCP設定を読み込めるようにしました。ClaudeはClaudeが公開しているClient IDでログインします。

0.1.9で共通検索Skill（`momonga-search`）を外しました。同梱のSkillsは分析コマンド24種だけです。
