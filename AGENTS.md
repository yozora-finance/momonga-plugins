# リリース

- スキルや同梱スクリプトを更新・公開するときは、サーバー側の要求版番号（`SKILL_REVISION`）も更新してデプロイする。公開順序はプラグイン → サーバー。
- `plugins/momonga-search/skills`・`plugins/commands.json` は配布元の生成処理が書き込む共通入力で、このリポジトリでは手で編集しない。Codex版・ChatGPT版のスキルと `release.json` の `commands` は `python3 .github/generate.py` が共通入力から生成する。
- ホストごとの更新確認の文面は `.github/generate.py`、Codexの更新補助は `plugins/codex/momonga-search/scripts/` だけで管理する。
