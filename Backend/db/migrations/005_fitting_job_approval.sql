-- 005_fitting_job_approval.sql — Gemini生成画像の確認・承認ステップを追加。
-- パイプラインを Gemini（画像生成）→ 承認待ち → Meshy+Blender（3D生成）の
-- 2フェーズに分けるため、ステータスに 'awaiting_approval' を追加する。

ALTER TABLE fitting_jobs DROP CONSTRAINT fitting_jobs_status_check;
ALTER TABLE fitting_jobs ADD CONSTRAINT fitting_jobs_status_check
  CHECK (status IN ('pending', 'processing', 'awaiting_approval', 'done', 'failed'));
