import { Router } from "express";
import { pool } from "../db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { ah } from "../utils";

const router = Router();

// 表示用に投稿者名（profiles.user_name）と、いいね/コメント件数を含めて返す。
const POST_SELECT = `
  SELECT p.id, p.user_id, p.image, p.thumbnail, p.video,
         p.caption, p.main_caption, p.sub_caption,
         p.likes_count AS likes, p.comments_count AS comments,
         pr.user_name AS user
  FROM posts p
  LEFT JOIN profiles pr ON pr.user_id = p.user_id
`;

router.get(
  "/",
  ah(async (_req, res) => {
    const result = await pool.query(`${POST_SELECT} ORDER BY p.id`);
    res.json(result.rows);
  })
);

// 固定パスは :id より先に登録する（Express はワイルドカードにマッチしうる）
router.get(
  "/liked",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query(
      `${POST_SELECT}
       JOIN post_likes pl ON pl.post_id = p.id
       WHERE pl.user_id = $1
       ORDER BY p.id DESC`,
      [req.userId]
    );
    res.json(result.rows);
  })
);

router.get(
  "/:id",
  ah(async (req, res) => {
    const result = await pool.query(`${POST_SELECT} WHERE p.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "見つかりません" });
    res.json(result.rows[0]);
  })
);

router.post(
  "/",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const { image, thumbnail, video, caption, main_caption, sub_caption } = req.body ?? {};
    const result = await pool.query(
      `INSERT INTO posts (user_id, image, thumbnail, video, caption, main_caption, sub_caption)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.userId,
        image ?? null,
        thumbnail ?? null,
        video ?? null,
        caption ?? null,
        main_caption ?? null,
        sub_caption ?? null,
      ]
    );
    res.status(201).json(result.rows[0]);
  })
);

router.delete(
  "/:id",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "見つかりません、または権限がありません" });
    }
    res.status(204).send();
  })
);

router.post(
  "/:id/like",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    await pool.query(
      "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  })
);

router.delete(
  "/:id/like",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    await pool.query(
      "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  })
);

export default router;
