import { Router } from "express";
import { pool } from "../db";
import { ah } from "../utils";

const router = Router();

router.get(
  "/",
  ah(async (_req, res) => {
    const result = await pool.query(
      "SELECT id, thumbnail, video, user_name, title FROM today_picks ORDER BY sort_order, id"
    );
    res.json(result.rows);
  })
);

export default router;
