-- 006_demo_glb.sql — デモ用のフィット済み GLB をシードアイテムに紐付ける。
--
-- GLB の実体は Backend/public/generated/brown_jacket.glb で、リポジトリに
-- コミットされている（Backend/.gitignore が *.glb だけ通している）。
-- docker-compose.yaml が同ディレクトリを bind mount するため、
-- clone して `docker compose up` しただけで着せ替えを試せる状態になる。
--

UPDATE clothing_items
   SET glb_url = '/generated/brown_jacket.glb'
 WHERE image = '/assets/brown_jacket.png';
