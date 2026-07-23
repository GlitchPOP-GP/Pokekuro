import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";

import authRouter from "./routes/auth";
import profilesRouter from "./routes/profiles";
import locationsRouter from "./routes/locations";
import tagsRouter from "./routes/tags";
import clothingItemsRouter from "./routes/clothingItems";
import postsRouter from "./routes/posts";
import todayPicksRouter from "./routes/todayPicks";
import uploadsRouter from "./routes/uploads";
import fittingJobsRouter from "./routes/fittingJobs";

const app = express();
app.use(cors());
app.use(express.json());

// 実機からのリクエストが本当に届いているかを確認するためのアクセスログ
app.use((req, _res, next) => {
  console.log(`[req] ${req.ip} ${req.method} ${req.originalUrl}`);
  next();
});

// 画像・動画などの静的アセット配信（DB には /assets/... の相対パスを保存し、
// フロント側で API のベースURLを前置して解決する）
app.use("/assets", express.static(path.join(__dirname, "..", "public", "assets")));

// 3Dモデル（GLB）配信。WebView 版ビューア（/viewer.html）が ?glb=/models/xxx.glb で読む
app.use("/models", express.static(path.join(__dirname, "..", "public", "models")));

// three.js を実ブラウザエンジン（WebView）で動かすビューアページ
app.use(express.static(path.join(__dirname, "..", "public"), { index: false }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/clothing-items", clothingItemsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/today-picks", todayPicksRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/fitting-jobs", fittingJobsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "サーバーエラーが発生しました" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`pokekuro API listening on :${PORT}`);
});
