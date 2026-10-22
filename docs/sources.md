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

## 個人向けデスクトップの追加画面

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
