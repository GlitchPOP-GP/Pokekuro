import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { ah } from "../utils";

const router = Router();

router.get(
  "/",
  ah(async (_req, res) => {
    const result = await pool.query("SELECT * FROM tags ORDER BY tag_name");
    res.json(result.rows);
  })
);

router.post(
  "/",
  requireAuth,
  ah(async (req, res) => {
    const { tag_name } = req.body ?? {};
    if (!tag_name) {
      return res.status(400).json({ error: "tag_name は必須です" });
    }
    const result = await pool.query(
      `INSERT INTO tags (tag_name) VALUES ($1)
       ON CONFLICT (tag_name) DO UPDATE SET tag_name = EXCLUDED.tag_name
       RETURNING *`,
      [tag_name]
    );
    res.status(201).json(result.rows[0]);
  })
);

export default router;
