import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { ah } from "../utils";

const router = Router();

router.get(
  "/",
  ah(async (_req, res) => {
    const result = await pool.query("SELECT * FROM locations ORDER BY name");
    res.json(result.rows);
  })
);

router.post(
  "/",
  requireAuth,
  ah(async (req, res) => {
    const { name, latitude, longitude, address } = req.body ?? {};
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "name, latitude, longitude は必須です" });
    }
    const result = await pool.query(
      "INSERT INTO locations (name, latitude, longitude, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, latitude, longitude, address ?? null]
    );
    res.status(201).json(result.rows[0]);
  })
);

export default router;
