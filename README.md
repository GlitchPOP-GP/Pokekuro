# pokekuro

服の写真から 3D モデルを生成し、アバターに着せ替えるアプリ。

| ディレクトリ | 内容 |
|---|---|
| `Backend/` | PostgreSQL + Express(TypeScript) API |
| `Frontend/` | React Native / Expo アプリ |
| `FittingPipeline/` | Blender + Python の着せ替えパイプライン |

compose ファイルはこのディレクトリの `docker-compose.yaml` 1つに統合されています。

---

## クイックスタート

```bash
cp .env.example .env      # ← 設定を書く唯一の場所。APIキーもここ
docker compose up -d --build
```

| | URL |
|---|---|
| API | http://localhost:8001/health |
| DB | `localhost:5432`（user/pass/db はすべて `pokekuro`） |

初回起動時に `Backend/db/migrations/*.sql` が自動実行され、デモデータまで入ります。
やり直すときは `docker compose down -v` でボリュームごと消してください。

---

## 用途別の起動

| コマンド | 起動するもの |
|---|---|
| `docker compose up -d` | db + api + pipeline |
| `docker compose watch` | 同上 ＋ ソース変更の自動同期（開発） |
| `docker compose --profile web up -d` | ＋ Web版フロント（http://localhost:8080） |
| `cd Frontend && npm run dev` | ＋ Expo dev server（実機・シミュレータ） |

`npm run dev` は開発PCの LAN IP を自動検出してルートの compose を
`--profile mobile` で起動します。実機の Expo Go は `localhost` では
開発PCに到達できないためです。自動検出が誤る場合は上書きできます:

```bash
HOST_IP=192.168.1.10 npm run dev
```

Web版（`--profile web`）は nginx が `/api` などを api にプロキシするため
同一オリジンになり、LAN IP に依存しません。

---

## APIキーの扱い

3D生成には Meshy と Gemini のキーが要ります。

- **記入する場所はルートの `.env` だけ**です。`Backend/.env` や
  `FittingPipeline/.env` は docker 外で単体実行する場合の予備であり、
  compose 経由では読まれません。
- キーを持つのは `pipeline` サービスのみです。`api` にも Frontend にも渡りません。
- **Docker イメージには一切含まれません。** 各 `.dockerignore` が `.env` を除外し、
  `Dockerfile` にもキーを書いていないため、`docker save` したイメージを配布しても
  キーは漏れません。実行時に `--env-file` / 環境変数で注入してください。
- ⚠️ `EXPO_PUBLIC_*` はクライアントバンドルに埋め込まれ、アプリ配布後は
  誰でも読み取れます。ここにキーを置かないでください。

キーが未設定でも起動はできます。その場合 pipeline が起動ログで警告し、
3D生成リクエストはジョブの `error_message` にエラーを残して失敗します。
設定状況は次で確認できます:

```bash
docker compose exec pipeline python -c \
  "import urllib.request;print(urllib.request.urlopen('http://localhost:9000/health').read())"
```

---

## イメージとして提出する

```bash
docker compose --profile web build

docker save \
  pokekuro-api:latest pokekuro-pipeline:latest pokekuro-web:latest \
  postgres:16-alpine \
  -o pokekuro-images.tar
```

同梱するもの: `pokekuro-images.tar` / `docker-compose.yaml` / `.env.example` /
`Backend/db/migrations/` / この README。

受け取り側:

```bash
docker load -i pokekuro-images.tar
cp .env.example .env         # キーを記入
docker compose --profile web up -d
open http://localhost:8080
```

---

## 環境に関する注意

- **Blender は amd64 のみ**。公式の linux-arm64 ビルドが存在しないため、
  `pipeline` サービスは `platform: linux/amd64` に固定しています。
  Apple Silicon では Docker Desktop の
  **Settings → General → Use Rosetta for x86/amd64 emulation** を有効にしてください。
  エミュレーション経由になるため、布シミュレーションは実機 amd64 より遅くなります。
- **イメージサイズは合計 2〜3GB 程度**です。大半が Blender 本体です。
- **ネイティブアプリ（.apk / .ipa）は Docker では作れません。** EAS Build を使ってください。
  Docker で提出できるのは Web 版（`--profile web`）です。
