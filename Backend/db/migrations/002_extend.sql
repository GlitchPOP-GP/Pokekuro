-- 002_extend.sql — UI が必要とする最小限の追加（仕様書に無い項目）
-- 方針: フロントの表示に必要な分だけ列・表を足す。

-- クローゼットのカードに表示するアイテム名（仕様書 clothing_items には無い）
ALTER TABLE clothing_items ADD COLUMN name VARCHAR(255);

-- 投稿カードに表示する投稿者名・キャプション・いいね数・コメント数。
-- いいねは post_likes（多対多）で実データを持てるが、表示用の初期件数として
-- 非正規化カウントを併用する（大量のダミー行を作らずに済む）。
ALTER TABLE posts ADD COLUMN caption        TEXT;
ALTER TABLE posts ADD COLUMN likes_count    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN comments_count INTEGER NOT NULL DEFAULT 0;

-- ホームの TODAY'S PICK カルーセル（仕様書に無い独立データ）
CREATE TABLE today_picks (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thumbnail  TEXT NOT NULL,        -- サムネイル画像 URL
  video      TEXT NOT NULL,        -- 動画 URL
  user_name  VARCHAR(100) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
