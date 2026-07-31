"""
run_pipeline.py — 着せ替えパイプライン実行ラッパー

使い方:
  python run_pipeline.py
  python run_pipeline.py --cloth path/to/custom_cloth.glb
  python run_pipeline.py --body  path/to/custom_body.glb
  python run_pipeline.py --frames 0   # 重力シミュを無効化（既定は 10 フレーム）

処理:
  Blender --background で pipeline_core.py を実行し、
  output/fitted.glb（体+服）と output/cloth_fitted.glb（服のみ）を生成する。
"""

import subprocess
import sys
import os
import json
import argparse

from blender_env import blender_exe

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)


def blender_run(script: str, extra_env: dict | None = None):
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    cmd = [
        blender_exe(),
        "--background",
        "--python", script,
    ]
    print(f"\n{'='*60}")
    print(f"[pipeline] {os.path.basename(script)}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, env=env)
    if result.returncode != 0:
        print(f"[pipeline] ERROR: {script} failed (exit {result.returncode})")
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cloth",     default=None, help="服の GLB パス（省略時は cloth.glb）")
    parser.add_argument("--body",      default=None, help="体の GLB パス（省略時は koba.glb）")
    parser.add_argument("--frames",    default=None, type=int, help="重力シミュのフレーム数（0=OFF、省略時は 10）")
    parser.add_argument("--output",    default=None, help="体+服 の出力先（省略時は output/fitted.glb）")
    parser.add_argument("--cloth-out", default=None, help="服のみ の出力先（省略時は output/cloth_fitted.glb）")
    args = parser.parse_args()

    env = {}
    if args.cloth:
        env["POKEKURO_CLOTH_PATH"] = os.path.abspath(args.cloth)
    if args.body:
        env["POKEKURO_BODY_PATH"] = os.path.abspath(args.body)
    if args.frames is not None:
        env["POKEKURO_SIM_FRAMES"] = str(args.frames)
    if args.output:
        env["POKEKURO_OUTPUT_PATH"] = os.path.abspath(args.output)
    if args.cloth_out:
        env["POKEKURO_CLOTH_OUT"] = os.path.abspath(args.cloth_out)

    core = os.path.join(BASE, "pipeline_core.py")

    try:
        blender_run(core, env)
    except SystemExit as e:
        print(json.dumps({"success": False, "error": f"Blender exited with code {e.code}"}))
        raise

    output = env.get("POKEKURO_OUTPUT_PATH", os.path.join(ROOT, "output", "fitted.glb"))
    cloth_out = env.get("POKEKURO_CLOTH_OUT", os.path.join(ROOT, "output", "cloth_fitted.glb"))

    if not os.path.exists(output) or not os.path.exists(cloth_out):
        print(json.dumps({"success": False, "error": "出力ファイルが生成されませんでした"}))
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"[pipeline] DONE  →  {output}")
    print(f"{'='*60}\n")
    print(json.dumps({"success": True, "output_path": output, "cloth_path": cloth_out}))


if __name__ == "__main__":
    main()
