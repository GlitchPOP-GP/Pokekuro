import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { signToken } from "../middleware/auth";
import { ah } from "../utils";

const router = Router();

router.post(
  "/register",
  ah(async (req, res) => {
    const { email, password, user_name } = req.body ?? {};
    if (!email || !password || !user_name) {
      return res.status(400).json({ error: "email, password, user_name は必須です" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "このメールアドレスは既に登録されています" });
    }

    const hash = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userResult = await client.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
        [email, hash]
      );
      const user = userResult.rows[0];
      await client.query("INSERT INTO profiles (user_id, user_name) VALUES ($1, $2)", [
        user.id,
        user_name,
      ]);
      await client.query("COMMIT");
      const token = signToken(user.id);
      res.status(201).json({ token, user: { id: user.id, email: user.email, user_name } });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/login",
  ah(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email, password は必須です" });
    }

    const result = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user || !user.password) {
      return res.status(401).json({ error: "メールアドレスまたはパスワードが違います" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "メールアドレスまたはパスワードが違います" });
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
  })
);

export default router;
