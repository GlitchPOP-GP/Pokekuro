-- 004_fitting_jobs.sql — 服の3D生成パイプライン（写真→Gemini→Meshy→Blenderフィッティング）
-- のジョブ状態を追跡するテーブル。

-- フィット済みの服単体GLBのURL（パイプライン完了後に設定される）
ALTER TABLE clothing_items ADD COLUMN glb_url TEXT;

CREATE TABLE fitting_jobs (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clothing_item_id   BIGINT NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  -- shirt = トップス用 pipeline_core.py、pants = ボトムス用 pipeline_bottoms.py
  category           VARCHAR(20) NOT NULL CHECK (category IN ('shirt', 'pants')),
  status             VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  source_image_path  TEXT,   -- アップロードされた元写真
  gemini_image_path  TEXT,   -- Gemini生成: 服だけのTポーズ画像
  meshy_glb_path     TEXT,   -- Meshy生成: 服単体GLB（フィット前）
  fitted_glb_path    TEXT,   -- Blenderフィット後: 服単体GLB（最終成果物）
  error_message      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fitting_jobs_clothing_item ON fitting_jobs(clothing_item_id);
