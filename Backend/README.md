# Backend (DB + API)

pokekuro の PostgreSQL データベース + Express(TypeScript) API サーバー。
DB スキーマは「グリッチポップ_ポケクロ_テーブル定義書」に準拠。

## 起動

compose ファイルはリポジトリルートに統合済みです。**ルートで**実行してください。

```bash
cd ..
cp .env.example .env
docker compose up -d --build
```

- `db`       … PostgreSQL 16（ホスト `localhost:5432`）
- `api`      … Express API（ホスト `localhost:8001` → コンテナ 4000）
- `pipeline` … Blender + Python（3D生成。`PIPELINE_URL=http://pipeline:9000` で呼ぶ）

Blender も Python も api イメージには入っていません。3D生成は `pipeline` サービスへ
HTTP で委譲し、入出力ファイルは共有ボリューム上の同一絶対パスでやり取りします。

初回起動（＝空 volume）時に `db/migrations/*.sql` がファイル名順で自動実行される:

1. `001_init.sql`   … 仕様書準拠の9テーブル
2. `002_extend.sql` … UI 表示に必要な追加（`clothing_items.name`、`posts` の caption/いいね・コメント数、`today_picks` 表）
3. `003_seed.sql`   … 旧 mockData の内容を初期データとして投入

マイグレーション/シードをやり直したい場合は volume ごと作り直す（ルートで実行）:

```bash
docker compose down -v && docker compose up -d --build
```

動作確認:

```bash
curl http://localhost:8001/health                     # {"ok":true}
curl http://localhost:8001/api/posts                  # シード済みの投稿12件
curl -o /dev/null -w "%{http_code}\n" http://localhost:8001/assets/brown_jacket.png  # 200
docker exec -it pokekuro-db psql -U pokekuro -d pokekuro -c "\dt"
```

## デモアカウント

シードで投入済み。Frontend の Login 画面の「ログイン」ボタンはこのアカウントで
自動ログインする（`bypassLogin`）。

```
email:    demo@pokekuro.app
password: demo1234
（ユーザー名 AIKA。クローゼット7点・お気に入り2点・投稿の一部を保有）
```

## 静的アセット

画像は `Backend/public/assets/` に置き、`GET /assets/...` で配信する。
DB には `/assets/xxx.png` の相対パスを保存し、Frontend 側で API ベースURLを
前置して解決する（`Frontend/src/api/client.ts` の `resolveMediaUrl`）。

## API エンドポイント

ベース: `http://localhost:8001`（Frontend の `EXPO_PUBLIC_API_URL` と一致）。
🔒 = JWT 必須（`Authorization: Bearer <token>`）。

| メソッド | パス | 内容 |
|---|---|---|
| POST | `/api/auth/register` | 新規登録（email, password, user_name）→ token 発行 & profiles 作成 |
| POST | `/api/auth/login` | ログイン → token 発行 |
| GET/PUT 🔒 | `/api/profiles/me` | 自分のプロフィール取得・更新 |
| GET | `/api/locations` | 位置情報一覧 |
| POST 🔒 | `/api/locations` | 位置情報登録 |
| GET | `/api/tags` | タグ一覧 |
| POST 🔒 | `/api/tags` | タグ upsert（既存なら流用） |
| GET | `/api/clothing-items` | 全アイテム（`?category=&season=&user_id=` で絞込） |
| GET 🔒 | `/api/clothing-items/mine` | 自分のアイテム一覧（tags 付き） |
| GET 🔒 | `/api/clothing-items/favorites` | 自分のお気に入り一覧 |
| GET | `/api/clothing-items/:id` | 単体取得 |
| POST 🔒 | `/api/clothing-items` | 登録（image, category, season, location_id, tag_ids[]） |
| DELETE 🔒 | `/api/clothing-items/:id` | 削除（自分のもののみ） |
| POST/DELETE 🔒 | `/api/clothing-items/:id/favorite` | お気に入り登録・解除 |
| GET | `/api/posts` | 投稿一覧（投稿者名・いいね/コメント数付き） |
| GET | `/api/posts/:id` | 投稿単体 |
| POST 🔒 | `/api/posts` | 投稿作成 |
| DELETE 🔒 | `/api/posts/:id` | 投稿削除（自分のもののみ） |
| POST/DELETE 🔒 | `/api/posts/:id/like` | いいね・解除 |
| GET | `/api/today-picks` | ホームの TODAY'S PICK カルーセル |
| GET | `/assets/...` | 画像・動画の静的配信 |

## Frontend との連携状況

ハードコード（`mockData.ts`）を廃止し、全画面が API + DB 駆動になった:

- ✅ **認証**: Login / Register → `/api/auth/*`。JWT を `AuthContext` が保持し、
  `RootNavigator` が認証状態でスタックを切り替える。
- ✅ **クローゼット**: `useCloset` / `RecentItems` → `/api/clothing-items/mine` + `/favorites`。
  日本語カテゴリ⇄タブキー（shirt/pants/cap）を `api/closet.ts` でマッピング。
- ✅ **アイテム追加**: `useItemAdd` → `/api/clothing-items`（タグは `/api/tags` upsert）。
- ✅ **ソーシャル投稿**: Shop / PostDetail → `/api/posts`（`api/posts.ts`）。
- ✅ **プロフィール**: Profile → `/api/profiles/me`（`api/profile.ts`）。
- ✅ **TODAY'S PICK**: ホーム → `/api/today-picks`（`api/todayPick.ts`）。

**残りのバンドル依存（意図的）**: `cameraSimulationImages`（`Frontend/src/data/mockData.ts`）のみ。
実機カメラが無い環境（シミュレータ）でアイテム追加プレビューに使うフォールバック画像で、
アプリの「データ」ではないため意図的にバンドルのまま残している。

**画像アップロードの実運用**: 現状アップロード先ストレージが無いため、カメラ撮影画像は
端末ローカルの `file://` URI を保存する（同一端末では表示可能だが共有はできない）。
本運用ではストレージ（S3 等）を足し、アップロードで得た URL を保存する必要がある。

## テーブル構成（仕様書準拠）

| 物理名 | 論理名 | 用途 |
|---|---|---|
| `users` | ユーザー | 認証情報（email, password）。id は UUID |
| `profiles` | プロフィール | users と1対1。表示名・画像・身長・体型・性別 |
| `locations` | 位置情報 | 店舗・撮影場所（緯度経度・住所） |
| `clothing_items` | 服アイテム | ユーザーが登録した服。category / season / location_id |
| `tags` | タグ | アイテムに付与できるタグ一覧 |
| `clothing_item_tags` | 服アイテムタグ | clothing_items × tags の中間テーブル |
| `posts` | 投稿 | ファッション写真・動画の投稿 |
| `post_likes` | 投稿いいね | posts × users の中間テーブル |
| `item_favorites` | アイテムお気に入り | clothing_items × users の中間テーブル |

`clothing_items` / `locations` / `tags` / `posts` の PK は仕様書通り `BIGINT`（連番）、
`users` / `profiles` の PK は `UUID`。

## 仕様書に無い / 未確定の点

- yzl3Dmodel パイプライン（`run_pipeline.py` 等）が生成する GLB をどのテーブルのどのカラムに
  紐付けるかは、この仕様書には定義されていない。`clothing_items.image` を服アイテムの代表画像
  として使い、フィット済みGLBは別途カラムかテーブルを追加する必要がありそう
  （例: `clothing_items` に `fitted_glb_url` を足す、または別テーブルを切る）。
- API サーバー自体が未実装。`Frontend/src/components/ModelViewer.tsx` は現状
  `require('../3dmodel/fitted.glb')` で静的バンドルしているだけなので、DB と繋ぐには
  API サーバーが必要。
