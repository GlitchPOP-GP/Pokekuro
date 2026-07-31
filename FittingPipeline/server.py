"""server.py — FittingPipeline を HTTP 経由で実行するラッパー

各スクリプトは「stdout の最終行に 1行 JSON を出す」という既存規約を持つため、
ここではその規約をそのまま HTTP レスポンスに変換するだけにしてある
（スクリプト本体には手を入れていない）。

Backend からはコンテナ間 HTTP（PIPELINE_URL=http://pipeline:9000）で呼ばれる。
入出力ファイルは api コンテナと同一の絶対パスで共有ボリュームに置かれる。
"""

import json
import os
import subprocess
import sys

from fastapi import FastAPI
from pydantic import BaseModel

SCRIPTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts")

app = FastAPI(title="pokekuro FittingPipeline")


def _key_status() -> dict:
    # 値は絶対に返さない・記録しない。設定済みかどうかだけ。
    return {
        "meshy_key": bool(os.environ.get("MESHY_API_KEY")),
        "gemini_key": bool(os.environ.get("GEMINI_API_KEY")),
    }


@app.on_event("startup")
def warn_missing_keys() -> None:
    missing = [k for k, ok in _key_status().items() if not ok]
    if missing:
        print(
            f"[pipeline] 警告: APIキーが未設定です ({', '.join(missing)})。"
            " リポジトリルートの .env に記入してから再起動してください。"
            " 3D生成リクエストはエラーになります。",
            flush=True,
        )


def run(script: str, args: list[str], timeout: int) -> dict:
    """scripts/<script> を実行し、最終行の JSON を返す。"""
    cmd = [sys.executable, os.path.join(SCRIPTS, script), *args]
    try:
        p = subprocess.run(
            cmd, cwd=SCRIPTS, capture_output=True, text=True, timeout=timeout
        )
    except subprocess.TimeoutExpired:
        return {"success": False, "error": f"{script} がタイムアウトしました ({timeout}s)"}

    lines = [ln for ln in p.stdout.strip().split("\n") if ln]
    try:
        return json.loads(lines[-1])
    except (IndexError, json.JSONDecodeError):
        tail = (p.stderr or p.stdout)[-1500:]
        return {
            "success": False,
            "error": f"{script} の出力解析に失敗しました (exit {p.returncode}): {tail}",
        }


@app.get("/health")
def health():
    return {"ok": True, "blender": os.environ.get("BLENDER_PATH"), **_key_status()}


class ExtractReq(BaseModel):
    input_path: str
    output_path: str
    category: str


@app.post("/extract")
def extract(req: ExtractReq):
    """撮影画像から服だけを切り出す（Gemini）。"""
    return run(
        "gemini_extract.py",
        [req.input_path, req.output_path, "--category", req.category],
        timeout=180,
    )


class GenerateReq(BaseModel):
    input_path: str
    output_path: str


@app.post("/generate")
def generate(req: GenerateReq):
    """服画像から GLB を生成する（Meshy）。数分かかる。"""
    return run("meshy_generate.py", [req.input_path, req.output_path], timeout=900)


class FitReq(BaseModel):
    category: str  # "shirt" | "pants"
    cloth_path: str
    output_path: str
    cloth_out: str


@app.post("/fit")
def fit(req: FitReq):
    """GLB をアバターにフィットさせる（Blender）。数分かかる。"""
    script = "run_pipeline.py" if req.category == "shirt" else "run_bottoms.py"
    return run(
        script,
        [
            "--cloth", req.cloth_path,
            "--output", req.output_path,
            "--cloth-out", req.cloth_out,
        ],
        timeout=900,
    )
