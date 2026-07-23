import { Router } from "express";
import { pool } from "../db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { ah } from "../utils";

const router = Router();

router.get(
  "/",
  ah(async (req, res) => {
    const { category, season, user_id } = req.query as Record<string, string | undefined>;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (category) {
      params.push(category);
      conditions.push(`ci.category = $${params.length}`);
    }
    if (season) {
      params.push(season);
      conditions.push(`ci.season = $${params.length}`);
    }
    if (user_id) {
      params.push(user_id);
      conditions.push(`ci.user_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT ci.*, COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') AS tags
       FROM clothing_items ci
       LEFT JOIN clothing_item_tags cit ON cit.clothing_item_id = ci.id
       LEFT JOIN tags t ON t.id = cit.tag_id
       ${where}
       GROUP BY ci.id
       ORDER BY ci.id DESC`,
      params
    );
    res.json(result.rows);
  })
);

// 固定パスは :id より先に登録する（Express はワイルドカードにマッチしうる）
router.get(
  "/mine",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query(
      `SELECT ci.*, COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') AS tags
       FROM clothing_items ci
       LEFT JOIN clothing_item_tags cit ON cit.clothing_item_id = ci.id
       LEFT JOIN tags t ON t.id = cit.tag_id
       WHERE ci.user_id = $1
       GROUP BY ci.id
       ORDER BY ci.id DESC`,
      [req.userId]
    );
    res.json(result.rows);
  })
);

router.get(
  "/favorites",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query(
      `SELECT ci.* FROM clothing_items ci
       JOIN item_favorites f ON f.clothing_item_id = ci.id
       WHERE f.user_id = $1
       ORDER BY ci.id DESC`,
      [req.userId]
    );
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  ah(async (req, res) => {
    const result = await pool.query(
      `SELECT ci.*, COALESCE(array_agg(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') AS tags
       FROM clothing_items ci
       LEFT JOIN clothing_item_tags cit ON cit.clothing_item_id = ci.id
       LEFT JOIN tags t ON t.id = cit.tag_id
       WHERE ci.id = $1
       GROUP BY ci.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "見つかりません" });
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const { image, name, category, season, location_id, tag_ids } = req.body ?? {};
    if (!image) return res.status(400).json({ error: "image は必須です" });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO clothing_items (user_id, image, name, category, season, location_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.userId, image, name ?? null, category ?? null, season ?? null, location_id ?? null]
      );
      const item = result.rows[0];
      if (Array.isArray(tag_ids)) {
        for (const tagId of tag_ids) {
          await client.query(
            "INSERT INTO clothing_item_tags (clothing_item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [item.id, tagId]
          );
        }
      }
      await client.query("COMMIT");
      res.status(201).json(item);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

router.delete(
  "/:id",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query(
      "DELETE FROM clothing_items WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "見つかりません、または権限がありません" });
    }
    res.status(204).send();
  })
);

router.post(
  "/:id/favorite",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    await pool.query(
      "INSERT INTO item_favorites (clothing_item_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  })
);

router.delete(
  "/:id/favorite",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    await pool.query(
      "DELETE FROM item_favorites WHERE clothing_item_id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  })
);

export default router;
