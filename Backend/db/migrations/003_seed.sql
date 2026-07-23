-- 003_seed.sql — これまでフロントにハードコードされていたモックデータをDBへ投入
-- （Frontend/src/data/mockData.ts の内容を初期データ化）

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- crypt() / gen_salt() 用

-- ── ユーザー & プロフィール ─────────────────────────────
-- AIKA はデモログイン用アカウント（Login 画面の「ログイン」ボタンで入る）。
--   email: demo@pokekuro.app  /  password: demo1234
INSERT INTO users (id, email, password) VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo@pokekuro.app', crypt('demo1234', gen_salt('bf'))),
  ('22222222-2222-2222-2222-222222222222', 'hana@pokekuro.app', crypt('demo1234', gen_salt('bf'))),
  ('33333333-3333-3333-3333-333333333333', 'yuki@pokekuro.app', crypt('demo1234', gen_salt('bf'))),
  ('44444444-4444-4444-4444-444444444444', 'mika@pokekuro.app', crypt('demo1234', gen_salt('bf')));

INSERT INTO profiles (user_id, user_name, profile_image, height, body_type, gender) VALUES
  ('11111111-1111-1111-1111-111111111111', 'AIKA', '/assets/clothes/cloth3.jpeg', 165, '普通', '女性'),
  ('22222222-2222-2222-2222-222222222222', 'HANA', '/assets/clothes/cloth2.webp', NULL, NULL, NULL),
  ('33333333-3333-3333-3333-333333333333', 'YUKI', '/assets/clothes/cloth6.webp', NULL, NULL, NULL),
  ('44444444-4444-4444-4444-444444444444', 'MIKA', '/assets/clothes/cloth4.webp', NULL, NULL, NULL);

-- ── タグ ─────────────────────────────────────────────
INSERT INTO tags (tag_name) VALUES
  ('#アウター'), ('#古着'), ('#カジュアル'), ('#春服'), ('#デート');

-- ── クローゼット（AIKA の所有アイテム）───────────────────
INSERT INTO clothing_items (user_id, name, image, category, season) VALUES
  ('11111111-1111-1111-1111-111111111111', 'デモアイテム',        '/assets/demo_mark.png',         'トップス', NULL),
  ('11111111-1111-1111-1111-111111111111', 'Brown Suede Jacket',  '/assets/brown_jacket.png',      'トップス', NULL),
  ('11111111-1111-1111-1111-111111111111', 'Navy Track Jacket',   '/assets/blue_track_jacket.png', 'トップス', '春'),
  ('11111111-1111-1111-1111-111111111111', 'Varsity Jacket',      '/assets/cream_jacket.png',      'トップス', '春'),
  ('11111111-1111-1111-1111-111111111111', 'Brown Cargo Pants',   '/assets/brown_cargo_pants.png', 'ボトムス', NULL),
  ('11111111-1111-1111-1111-111111111111', 'Blue Denim Jeans',    '/assets/blue_denim_jeans.png',  'ボトムス', '春'),
  ('11111111-1111-1111-1111-111111111111', 'Brown Baseball Cap',  '/assets/brown_baseball_cap.png','帽子',     '春');

-- 服アイテム × タグ（image をキーに解決）
INSERT INTO clothing_item_tags (clothing_item_id, tag_id)
SELECT ci.id, t.id FROM clothing_items ci, tags t
WHERE (ci.image, t.tag_name) IN (
  ('/assets/brown_jacket.png',      '#アウター'),
  ('/assets/brown_jacket.png',      '#古着'),
  ('/assets/brown_jacket.png',      '#カジュアル'),
  ('/assets/blue_track_jacket.png', '#アウター'),
  ('/assets/blue_track_jacket.png', '#カジュアル'),
  ('/assets/blue_track_jacket.png', '#春服'),
  ('/assets/cream_jacket.png',      '#アウター'),
  ('/assets/cream_jacket.png',      '#デート'),
  ('/assets/cream_jacket.png',      '#春服'),
  ('/assets/brown_cargo_pants.png', '#古着'),
  ('/assets/brown_cargo_pants.png', '#カジュアル'),
  ('/assets/blue_denim_jeans.png',  '#カジュアル'),
  ('/assets/blue_denim_jeans.png',  '#春服'),
  ('/assets/brown_baseball_cap.png','#カジュアル'),
  ('/assets/brown_baseball_cap.png','#春服')
);

-- お気に入り（heart タブに出る）
INSERT INTO item_favorites (clothing_item_id, user_id)
SELECT ci.id, '11111111-1111-1111-1111-111111111111'
FROM clothing_items ci
WHERE ci.image IN ('/assets/blue_denim_jeans.png', '/assets/brown_baseball_cap.png');

-- ── 投稿（ソーシャルフィード）─────────────────────────────
INSERT INTO posts (user_id, image, caption, likes_count, comments_count) VALUES
  ('11111111-1111-1111-1111-111111111111', '/assets/clothes/cloth1.webp',  'シンプルなコーデが好き #カジュアル #古着', 128, 24),
  ('22222222-2222-2222-2222-222222222222', '/assets/clothes/cloth2.webp',  '今日のコーデです！ #春服 #アウター',       87, 12),
  ('33333333-3333-3333-3333-333333333333', '/assets/clothes/cloth3.jpeg',  'お気に入りの1枚 #カジュアル',              203, 31),
  ('44444444-4444-4444-4444-444444444444', '/assets/clothes/cloth4.webp',  'プチプラコーデ #古着 #デート',             65,  8),
  ('11111111-1111-1111-1111-111111111111', '/assets/clothes/cloth5.webp',  'ナチュラルテイスト #春服',                144, 19),
  ('22222222-2222-2222-2222-222222222222', '/assets/clothes/cloth6.webp',  'ゆるっとコーデ #カジュアル',                92, 15),
  ('33333333-3333-3333-3333-333333333333', '/assets/clothes/cloth7.webp',  'モノトーンが好き #アウター',               176, 28),
  ('44444444-4444-4444-4444-444444444444', '/assets/clothes/cloth8.webp',  'お気に入り #春服 #デート',                  54,  7),
  ('11111111-1111-1111-1111-111111111111', '/assets/clothes/cloth1.webp',  '2回目の投稿！ #カジュアル',                310, 42),
  ('22222222-2222-2222-2222-222222222222', '/assets/clothes/cloth2.webp',  '秋のコーデ #古着',                          99, 11),
  ('33333333-3333-3333-3333-333333333333', '/assets/clothes/cloth3.jpeg',  '冬準備 #アウター',                         133, 20),
  ('44444444-4444-4444-4444-444444444444', '/assets/clothes/cloth4.webp',  'デートコーデ #デート',                      77,  9);

-- ── TODAY'S PICK ────────────────────────────────────────
INSERT INTO today_picks (thumbnail, video, user_name, title, sort_order) VALUES
  ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900',
   'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
   'hayato', 'Summer Casual', 1),
  ('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900',
   'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
   'miku', 'Street Mode', 2),
  ('https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900',
   'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
   'miku', 'Street Mode', 3);
