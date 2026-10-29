# リリース

- スキルや同梱スクリプトを更新・公開するときは、サーバー側の要求版番号（`SKILL_REVISION`）も更新してデプロイする。公開順序はプラグイン → サーバー。
- 共通の薄いスキルは `plugins/momonga-search/skills` だけを編集し、`python3 .github/generate.py` でCodex版とChatGPT版を生成する。生成物を手で編集しない。
