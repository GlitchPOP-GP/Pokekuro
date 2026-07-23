import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth";
import { ah } from "../utils";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("画像ファイルのみアップロードできます"));
    }
    cb(null, true);
  },
});

const router = Router();

router.post(
  "/",
  requireAuth,
  upload.single("image"),
  ah(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "image ファイルが必要です" });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  })
);

export default router;
