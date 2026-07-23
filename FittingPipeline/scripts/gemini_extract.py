"""
gemini_extract.py — 写真から服だけを切り出した、Meshy入力用の正面画像を生成する

使い方:
  python gemini_extract.py <入力画像パス> <出力画像パス> [--category shirt|pants]

処理:
  Gemini の画像編集機能（gemini-2.5-flash-image、無料枠あり）に、人物写真または服の写真を渡し、
  「背景を取り除き、服だけを正面から見た状態で返す」よう指示する。
  ※ gemini-3.1-flash-image は2026年7月時点で有料専用のため使わない。
  Meshy の image-to-3d は単体の服写真の方が綺麗に立体化できるため、
  人物が写っている場合はここで服だけに切り出しておく。

  Node.js から subprocess で呼ばれる想定なので、結果は最後に1行のJSONとして
  stdout に出力する: {"success": true, "output_path": "..."} または
  {"success": false, "error": "..."}
"""

import sys
import os
import json
import argparse

from dotenv import load_dotenv
# override=True: 親プロセス（Node.js）から引き継いだ古い環境変数より
# .env ファイルの値を優先する（そうしないとキー更新が反映されない）
load_dotenv(override=True)

from google import genai
from google.genai import types

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-image")

PROMPTS = {
    "shirt": (
        "Extract ONLY the upper-body garment (top) from this photo. "
        "Render it using the 'ghost mannequin' / 'invisible mannequin' product-photography technique, "
        "exactly as used for e-commerce clothing listings: the garment must show natural 3D volume and drape "
        "as if worn, but there must be absolutely NO mannequin, NO human body, and NO skin, face, hair, neck, "
        "hands, fingers, arms, or legs visible anywhere — not even as a faint outline, shadow, or silhouette "
        "through fabric or openings. The neckline, cuffs, and hem openings must show hollow empty space "
        "(the plain white background showing through), not any body part or mannequin surface.\n\n"
        "STRICT POSE REQUIREMENT: the garment must be posed in an exact, perfect T-pose as if worn by an "
        "invisible person standing upright facing the camera: both sleeves extended straight out to the sides, "
        "perfectly horizontal, at exactly 90 degrees from the body (shoulder height), forming a completely "
        "straight flat line from left cuff to right cuff. Do NOT let the sleeves droop, angle downward, bend, "
        "or hang at any angle other than perfectly horizontal — this is the single most important requirement. "
        "The body of the garment must hang straight and symmetrical, centered, facing directly forward.\n\n"
        "Do not alter the garment's shape, color, pattern, or material from the source photo. Minimal wrinkles. "
        "Background must be plain solid white. Output only the final image."
    ),
    "pants": (
        "Extract ONLY the lower-body garment (bottoms/pants) from this photo. "
        "Render it using the 'ghost mannequin' / 'invisible mannequin' product-photography technique, "
        "exactly as used for e-commerce clothing listings: the garment must show natural 3D volume and drape "
        "as if worn, but there must be absolutely NO mannequin, NO human body, and NO skin, feet, toes, or legs "
        "visible anywhere — not even as a faint outline, shadow, or silhouette through fabric or openings. "
        "The waistband and ankle/hem openings must show hollow empty space (the plain white background showing "
        "through), not any body part or mannequin surface.\n\n"
        "STRICT POSE REQUIREMENT: the garment must be posed in an exact, perfect upright standing pose as if "
        "worn by an invisible person standing straight facing the camera: both legs straight, fully extended "
        "downward, perfectly vertical, parallel to each other, and symmetrical. Do NOT let the legs bend, twist, "
        "spread apart, or angle away from straight vertical — this is the single most important requirement. "
        "The garment must be centered, facing directly forward.\n\n"
        "Do not alter the garment's shape, color, pattern, or material from the source photo. Minimal wrinkles. "
        "Background must be plain solid white. Output only the final image."
    ),
}


def extract(input_path: str, output_path: str, category: str) -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY が設定されていません")

    if not os.path.exists(input_path):
        raise RuntimeError(f"入力画像が見つかりません: {input_path}")

    with open(input_path, "rb") as f:
        image_bytes = f.read()

    ext = os.path.splitext(input_path)[1].lower()
    mime = {".png": "image/png", ".webp": "image/webp"}.get(ext, "image/jpeg")

    client = genai.Client(api_key=api_key)

    prompt = PROMPTS.get(category, PROMPTS["shirt"])

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime),
            prompt,
        ],
        config=types.GenerateContentConfig(response_modalities=["IMAGE"]),
    )

    if not response.candidates or not response.candidates[0].content.parts:
        raise RuntimeError("Gemini から画像が返されませんでした")

    for part in response.candidates[0].content.parts:
        if part.inline_data:
            os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(part.inline_data.data)
            return

    raise RuntimeError("Gemini の応答に画像データが含まれていませんでした")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_path")
    parser.add_argument("output_path")
    parser.add_argument("--category", choices=["shirt", "pants"], default="shirt")
    args = parser.parse_args()

    try:
        extract(args.input_path, args.output_path, args.category)
        print(json.dumps({"success": True, "output_path": args.output_path}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
