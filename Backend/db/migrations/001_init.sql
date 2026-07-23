-- 001_init.sql — 初期スキーマ
-- 「グリッチポップ_ポケクロ_テーブル定義書」に準拠（システム名: ポケクロ）

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  -- ハッシュ化必須。Googleログイン利用時はNULL可
  password   VARCHAR(255)
);

CREATE TABLE locations (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- 店舗名・施設名など
  name      VARCHAR(255) NOT NULL,
  latitude  DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  address   TEXT
);

-- users と1対1
CREATE TABLE profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  user_name     VARCHAR(50) UNIQUE NOT NULL,
  -- URLまたはストレージキー
  profile_image TEXT,
  -- 単位: cm
  height        INTEGER,
  -- 細身 / 普通 / デブ / 2XL
  body_type     VARCHAR(20),
  gender        VARCHAR(20)
);

CREATE TABLE clothing_items (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- URLまたはストレージキー
  image       TEXT NOT NULL,
  -- トップス / ボトムス / 帽子 / その他
  category    VARCHAR(50),
  -- 春 / 夏 / 秋 / 冬 / オールシーズン
  season      VARCHAR(20),
  location_id BIGINT REFERENCES locations(id)
);

CREATE TABLE tags (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tag_name VARCHAR(100) UNIQUE NOT NULL
);

-- 服アイテムとタグの多対多関係を保持する中間テーブル
CREATE TABLE clothing_item_tags (
  clothing_item_id BIGINT NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  tag_id           BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (clothing_item_id, tag_id)
);

CREATE TABLE posts (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- URLまたはストレージキー
  image        TEXT,
  -- 表示用サムネイル。URLまたはストレージキー
  thumbnail    TEXT,
  -- URLまたはストレージキー
  video        TEXT,
  main_caption TEXT,
  sub_caption  TEXT
);

-- ユーザーが投稿に付与したいいね
CREATE TABLE post_likes (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- ユーザーがお気に入り登録した服アイテムの関係
CREATE TABLE item_favorites (
  clothing_item_id BIGINT NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (clothing_item_id, user_id)
);

CREATE INDEX idx_clothing_items_user     ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_location ON clothing_items(location_id);
CREATE INDEX idx_posts_user              ON posts(user_id);
