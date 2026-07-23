import { Router } from "express";
import { pool } from "../db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { ah } from "../utils";

const router = Router();

router.get(
  "/me",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const result = await pool.query(
      `SELECT p.user_id, p.user_name, p.profile_image, p.height, p.body_type, p.gender, u.email
       FROM profiles p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "プロフィールが見つかりません" });
    }
    res.json(result.rows[0]);
  })
);

router.put(
  "/me",
  requireAuth,
  ah<AuthedRequest>(async (req, res) => {
    const { user_name, profile_image, height, body_type, gender } = req.body ?? {};
    const result = await pool.query(
      `UPDATE profiles SET
         user_name = COALESCE($1, user_name),
         profile_image = COALESCE($2, profile_image),
         height = COALESCE($3, height),
         body_type = COALESCE($4, body_type),
         gender = COALESCE($5, gender)
       WHERE user_id = $6
       RETURNING user_id, user_name, profile_image, height, body_type, gender`,
      [user_name, profile_image, height, body_type, gender, req.userId]
    );
    res.json(result.rows[0]);
  })
);

export default router;
