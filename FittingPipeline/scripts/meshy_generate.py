"""
meshy_generate.py — 服の画像から Meshy AI で3Dモデル(GLB)を生成する

使い方:
  python meshy_generate.py <入力画像パス> <出力GLBパス>

旧 Meshy.py / meshy_gen.py（固定ファイル名・重複コード）を統合し、CLI引数対応にしたもの。
Node.js から subprocess で呼ばれる想定なので、結果は最後に1行のJSONとして
stdout に出力する: {"success": true, "output_path": "..."} または
{"success": false, "error": "..."}
"""

import requests
import base64
import time
import sys
import os
import json
import argparse
import urllib3
from dotenv import load_dotenv

load_dotenv(override=True)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_KEY = os.getenv("MESHY_API_KEY")
POLL_INTERVAL_SEC = 10


def load_image_as_base64(image_path: str) -> str:
    ext = os.path.splitext(image_path)[1].lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    mime = mime_types.get(ext, "image/jpeg")

    with open(image_path, "rb") as f:
        data = base64.b64encode(f.read()).decode()

    return f"data:{mime};base64,{data}"


def create_job(image_base64: str) -> str:
    response = requests.post(
        "https://api.meshy.ai/openapi/v1/image-to-3d",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "image_url": image_base64,
            "ai_model": "meshy-6",
            "topology": "triangle",
            "target_polycount": 50000,
            "should_remesh": True,
            "art_style": "realistic",
        },
        verify=False,
    )

    if response.status_code not in (200, 202):
        raise RuntimeError(f"ジョブ作成エラー ({response.status_code}): {response.text}")

    return response.json()["result"]


def wait_for_completion(job_id: str) -> str:
    while True:
        response = requests.get(
            f"https://api.meshy.ai/openapi/v1/image-to-3d/{job_id}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            verify=False,
        )

        if response.status_code != 200:
            raise RuntimeError(f"ステータス確認エラー ({response.status_code})")

        data = response.json()
        status = data["status"]

        if status == "SUCCEEDED":
            return data["model_urls"]["glb"]

        if status == "FAILED":
            message = data.get("task_error", {}).get("message", "不明なエラー")
            raise RuntimeError(f"生成失敗: {message}")

        time.sleep(POLL_INTERVAL_SEC)


def download_glb(glb_url: str, output_path: str):
    response = requests.get(glb_url, verify=False)

    if response.status_code != 200:
        raise RuntimeError(f"ダウンロードエラー ({response.status_code})")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(response.content)


def generate(input_path: str, output_path: str):
    if not API_KEY:
        raise RuntimeError("MESHY_API_KEY が設定されていません")
    if not os.path.exists(input_path):
        raise RuntimeError(f"入力画像が見つかりません: {input_path}")

    image_base64 = load_image_as_base64(input_path)
    job_id = create_job(image_base64)
    glb_url = wait_for_completion(job_id)
    download_glb(glb_url, output_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_path")
    parser.add_argument("output_path")
    args = parser.parse_args()

    try:
        generate(args.input_path, args.output_path)
        print(json.dumps({"success": True, "output_path": args.output_path}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
