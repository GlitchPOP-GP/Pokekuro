# Frontend

React Native / Expo アプリ。

起動はリポジトリルートの docker compose にまとめてあります。
設定もルートの `.env` 1ファイルだけです。

```bash
cd ..
cp .env.example .env       # HOST_IP に開発PCの LAN IP を書く
docker compose --profile mobile up -d
docker compose logs -f expo   # QR が出る
```

詳細はルートの README を参照してください。

## docker を使わずに動かす場合

```bash
npm install
npm start
```

このときだけ `Frontend/.env` が使われます（compose 経由では読まれません）。
