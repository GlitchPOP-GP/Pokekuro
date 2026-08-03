# pokekuro

服の写真から 3D モデルを生成し、アバターに着せ替えるアプリ。

| ディレクトリ | 内容 |
|---|---|
| `Backend/` | PostgreSQL + Express(TypeScript) API |
| `Frontend/` | React Native / Expo アプリ |
| `FittingPipeline/` | Blender + Python の着せ替えパイプライン |

---

## クイックスタート

```bash
git clone <このリポジトリ>
cd pokekuro

cp .env.example .env
#   .env を開いて HOST_IP に開発PCの LAN IP を書く
#     macOS  ipconfig getifaddr en0
#     Linux  hostname -I | awk '{print $1}'

docker compose --profile mobile up -d --build
docker compose logs -f expo        # QR が出る
```

**設定は `.env` の1ファイルだけです。** 実機の Expo Go は `localhost` では
開発PCに到達できないため、`HOST_IP` の記入が必要です。ホストの LAN IP は
コンテナ側から取得できないので、ここは手で書きます。

初回はイメージのビルドに 10〜15 分ほどかかります（Blender 約300MB の取得を
含むため）。2回目以降はキャッシュが効きます。

アプリは実機の Expo Go で開きます。上のログに出る QR を読んでください。
`HOST_IP` が違っていると expo の起動ログが警告します。

| | URL |
|---|---|
| API | http://localhost:8001/health |
| DB | `localhost:55432`（user/pass/db はすべて `pokekuro`） |

初回起動時に `Backend/db/migrations/*.sql` が自動実行され、デモデータが入ります。
デモアイテム「Brown Suede Jacket」にはフィット済みの 3D モデルが紐付けてあるので、
**APIキー無し・課金ゼロのまま着せ替えを試せます**（`006_demo_glb.sql`）。

やり直すときは `docker compose down -v` でボリュームごと消してください。

新しい服を写真から 3D 化する場合のみ、APIキーが要ります（下記「APIキーの扱い」）。

```bash
cp .env.example .env      # ← キーを書く唯一の場所
```

---

## 用途別の起動

| コマンド | 起動するもの |
|---|---|
| `docker compose up -d` | db + api + pipeline |
| `docker compose --profile mobile up -d` | ＋ Expo dev server（実機・シミュレータ） |
| `docker compose --profile mobile watch` | 同上 ＋ ソース変更の自動同期（開発） |

### LAN IP の扱い

実機の Expo Go は `localhost` では開発PCに到達できないため、QR には開発PCの
LAN IP を埋める必要があります。`.env` の `HOST_IP` がそれです。

この値は**コンテナ生成時に固定されます。** Wi-Fi を変えるなどで IP が変わったら、
`.env` を書き換えてコンテナを作り直してください。

```bash
docker compose --profile mobile up -d
```

古い IP のまま起動した場合、expo が起動ログで警告します。

```
[警告] 10.200.5.138:8001 に到達できません。
開発PCの LAN IP が変わった可能性が高いです…
```

> ホストの LAN IP をコンテナ側から取得することはできません。Docker Desktop では
> `--network host` にしても見えるのは VM 内部のアドレスだけです。そのため
> 自動検出は行わず、`.env` への記入に統一しています。
>
> なお **API のベースURLは実行時に自動導出されます**。端末が実際に繋がった
> Metro のホストを流用するため（`Frontend/src/api/client.ts`）、`HOST_IP` が
> 多少ずれていてもアプリ内の通信は追従します。

---

## APIキーの扱い

3D生成には Meshy と Gemini のキーが要ります。

キーが未設定でも起動はできます。その場合 pipeline が起動ログで警告し、
3D生成リクエストはジョブの `error_message` にエラーを残して失敗します。
設定状況は次で確認できます:

```bash
docker compose exec pipeline python -c \
  "import urllib.request;print(urllib.request.urlopen('http://localhost:9000/health').read())"
```

---

## イメージとして提出する

リポジトリのソースを渡さなくても、**イメージと compose ファイルだけで動きます。**

```bash
docker compose --profile mobile build

docker save \
  pokekuro-db:latest pokekuro-api:latest \
  pokekuro-pipeline:latest pokekuro-expo:latest \
  -o pokekuro-images.tar
```

同梱するもの: **`pokekuro-images.tar` / `docker-compose.yaml` / この README** の3点だけ。

マイグレーションは `pokekuro-db` に、アバターとデモ用 GLB は `pokekuro-api` に
焼き込んであるため、リポジトリのファイルは要りません。

### 受け取り側

```bash
docker load -i pokekuro-images.tar

# PC の LAN IP を .env に書く（実機で開くために必須）
#   macOS    ipconfig getifaddr en0
#   Linux    hostname -I | awk '{print $1}'
#   Windows  ipconfig      （「IPv4 アドレス」）
echo "HOST_IP=192.168.1.10" > .env

docker compose --profile mobile up -d
docker compose logs -f expo        # QR が出る
```

**Windows（PowerShell）の注意**: `echo ... > .env` は UTF-16 で書き出されて
compose が読めません。次のどちらかにしてください。

```powershell
Set-Content -Path .env -Value "HOST_IP=192.168.1.10" -Encoding utf8
# または メモ帳で .env を作り、HOST_IP=192.168.1.10 と書いて保存
```

イメージはすべて `linux/amd64` で焼いてあるので、Windows / Intel Mac / Linux
そのまま動きます。Apple Silicon の場合は Docker Desktop の
**Settings → General → Use Rosetta for x86/amd64 emulation** を有効にしてください。

`docker compose up` は**イメージが既にあればビルドしません**。`build:` の指定は
残っていますが、`docker load` 済みならソースが無くても起動します。

IP が違っていると expo の起動ログが警告します。値を直して
`docker compose --profile mobile up -d` をやり直してください。

---

## 環境に関する注意

- **全サービスを `platform: linux/amd64` に固定しています。**
  理由は2つです。Blender に公式の linux-arm64 ビルドが無いこと、そして
  Apple Silicon で焼くと既定が arm64 になり、Windows / Intel Mac / Linux で
  受け取った側が `exec format error` で起動できなくなることです。
  Apple Silicon で動かす場合は Docker Desktop の
  **Settings → General → Use Rosetta for x86/amd64 emulation** を有効にしてください。
  エミュレーション経由になるため、布シミュレーションは実機 amd64 より遅くなります。
- **イメージサイズは合計 2〜3GB 程度**です。大半が Blender 本体です。
