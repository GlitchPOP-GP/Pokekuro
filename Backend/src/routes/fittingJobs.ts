import { Router } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { pool } from "../db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { ah } from "../utils";
import { runPythonScript } from "../pipeline/runScript";

const PIPELINE_ROOT = process.env.PIPELINE_ROOT || "";
const SCRIPTS_DIR = path.join(PIPELINE_ROOT, "scripts");
const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");
const TMP_DIR = path.join(__dirname, "..", "..", "tmp");
const GENERATED_DIR = path.join(PUBLIC_DIR, "generated");

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(GENERATED_DIR, { recursive: true });

const router = Router();

// Gemini生成画像は承認前でもフロントに見せる必要があるため、
// TMP_DIR ではなく公開ディレクトリ（GENERATED_DIR）に置き、
// gemini_image_path には絶対パス（Meshy呼び出し用）ではなく公開URLを持たせる。
function toPublicUrl(absPath: string): string | null {
  if (!absPath) return null;
  const rel = path.relative(PUBLIC_DIR, absPath);
  if (rel.startsWith("..")) return null;
  return "/" + rel.split(path.sep).join("/");
}

function toAbsPath(publicUrl: string): string {
  return path.join(PUBLIC_DIR, publicUrl);
}

router.get(
  "/:id",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query("SELECT * FROM fitting_jobs WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "見つかりません" });
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const { clothing_item_id, category } = req.body ?? {};
    if (!clothing_item_id || !["shirt", "pants"].includes(category)) {
      return res.status(400).json({ error: "clothing_item_id, category(shirt|pants) は必須です" });
    }

    const itemResult = await pool.query(
      "SELECT id, image FROM clothing_items WHERE id = $1 AND user_id = $2",
      [clothing_item_id, req.userId]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "服アイテムが見つかりません" });
    }
    const item = itemResult.rows[0];
    if (!item.image || !String(item.image).startsWith("/uploads/")) {
      return res.status(400).json({ error: "アップロードされた画像が無いアイテムです（/api/uploads で先に登録してください）" });
    }
    const sourceImagePath = path.join(PUBLIC_DIR, item.image);

    const jobResult = await pool.query(
      `INSERT INTO fitting_jobs (clothing_item_id, category, status, source_image_path)
       VALUES ($1, $2, 'pending', $3) RETURNING *`,
      [clothing_item_id, category, sourceImagePath]
    );
    const job = jobResult.rows[0];

    res.status(202).json(job);

    // レスポンスを返した後、非同期で Gemini 抽出だけを実行する（Meshy/Blenderはまだ呼ばない）
    runGeminiPhase(job.id, sourceImagePath, category).catch((err) => {
      console.error(`[fitting-job ${job.id}] unexpected error`, err);
    });
  })
);

// Gemini生成画像を確認した後、続き（Meshy→Blender）を実行する
router.post(
  "/:id/approve",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const jobResult = await pool.query(
      `SELECT fj.* FROM fitting_jobs fj
       JOIN clothing_items ci ON ci.id = fj.clothing_item_id
       WHERE fj.id = $1 AND ci.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "見つかりません" });
    }
    const job = jobResult.rows[0];
    if (job.status !== "awaiting_approval") {
      return res.status(400).json({ error: `このジョブは承認待ち状態ではありません（現在: ${job.status}）` });
    }

    await updateJob(job.id, { status: "processing" });
    res.status(202).json({ ...job, status: "processing" });

    runMeshyAndBlenderPhase(job.id, toAbsPath(job.gemini_image_path), job.category).catch((err) => {
      console.error(`[fitting-job ${job.id}] unexpected error`, err);
    });
  })
);

async function updateJob(id: number, fields: Record<string, unknown>) {
  const keys = Object.keys(fields);
  const setSql = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  await pool.query(`UPDATE fitting_jobs SET ${setSql}, updated_at = now() WHERE id = $1`, [
    id,
    ...keys.map((k) => fields[k]),
  ]);
}

async function runGeminiPhase(jobId: number, sourceImagePath: string, category: "shirt" | "pants") {
  await updateJob(jobId, { status: "processing" });

  const uid = crypto.randomUUID();
  const geminiOut = path.join(GENERATED_DIR, `${uid}-gemini.png`);

  try {
    console.log(`[fitting-job ${jobId}] step 1/3: gemini_extract`);
    const geminiResult = await runPythonScript(
      path.join(SCRIPTS_DIR, "gemini_extract.py"),
      [sourceImagePath, geminiOut, "--category", category],
      SCRIPTS_DIR
    );
    if (!geminiResult.success) throw new Error(`Gemini: ${geminiResult.error}`);

    const geminiPublicUrl = toPublicUrl(geminiOut);
    await updateJob(jobId, { status: "awaiting_approval", gemini_image_path: geminiPublicUrl });

    // クローゼットに表示する画像も、撮影した写真ではなく Gemini 生成画像に差し替える
    const jobRow = await pool.query("SELECT clothing_item_id FROM fitting_jobs WHERE id = $1", [jobId]);
    await pool.query("UPDATE clothing_items SET image = $1 WHERE id = $2", [
      geminiPublicUrl,
      jobRow.rows[0].clothing_item_id,
    ]);

    console.log(`[fitting-job ${jobId}] awaiting approval`);
  } catch (err: any) {
    console.error(`[fitting-job ${jobId}] failed`, err);
    await updateJob(jobId, { status: "failed", error_message: String(err.message || err) });
  }
}

async function runMeshyAndBlenderPhase(jobId: number, geminiOut: string, category: "shirt" | "pants") {
  const uid = crypto.randomUUID();
  const meshyOut = path.join(TMP_DIR, `${uid}-meshy.glb`);
  const fittedFullOut = path.join(TMP_DIR, `${uid}-full.glb`);
  const fittedClothOut = path.join(GENERATED_DIR, `${uid}.glb`);

  try {
    console.log(`[fitting-job ${jobId}] step 2/3: meshy_generate`);
    const meshyResult = await runPythonScript(
      path.join(SCRIPTS_DIR, "meshy_generate.py"),
      [geminiOut, meshyOut],
      SCRIPTS_DIR
    );
    if (!meshyResult.success) throw new Error(`Meshy: ${meshyResult.error}`);
    await updateJob(jobId, { meshy_glb_path: meshyOut });

    console.log(`[fitting-job ${jobId}] step 3/3: blender fit (${category})`);
    const pipelineScript = category === "shirt" ? "run_pipeline.py" : "run_bottoms.py";
    const fitResult = await runPythonScript(
      path.join(SCRIPTS_DIR, pipelineScript),
      ["--cloth", meshyOut, "--output", fittedFullOut, "--cloth-out", fittedClothOut],
      SCRIPTS_DIR
    );
    if (!fitResult.success) throw new Error(`Blenderフィッティング: ${fitResult.error}`);

    const glbUrl = `/generated/${uid}.glb`;
    await updateJob(jobId, { status: "done", fitted_glb_path: glbUrl });

    const jobRow = await pool.query("SELECT clothing_item_id FROM fitting_jobs WHERE id = $1", [jobId]);
    await pool.query("UPDATE clothing_items SET glb_url = $1 WHERE id = $2", [
      glbUrl,
      jobRow.rows[0].clothing_item_id,
    ]);

    console.log(`[fitting-job ${jobId}] done -> ${glbUrl}`);
  } catch (err: any) {
    console.error(`[fitting-job ${jobId}] failed`, err);
    await updateJob(jobId, { status: "failed", error_message: String(err.message || err) });
  }
}

export default router;
