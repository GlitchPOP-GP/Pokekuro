"""
run_bottoms.py — ボトムス用パイプライン実行ラッパー

使い方:
  python run_bottoms.py
  python run_bottoms.py --cloth path/to/bottoms.glb
  python run_bottoms.py --frames 0   # 重力シミュを無効化（既定は 20 フレーム）

処理:
  Blender --background で pipeline_bottoms.py を実行し、
  output/fitted_bottoms.glb（体+ボトムス）と
  output/bottoms_fitted.glb（ボトムスのみ）を生成する。
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
    print(f"[bottoms] {os.path.basename(script)}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, env=env)
    if result.returncode != 0:
        print(f"[bottoms] ERROR: {script} failed (exit {result.returncode})")
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cloth",     default=None, help="ボトムスの GLB パス（省略時は bottomscloth.glb）")
    parser.add_argument("--body",      default=None, help="体の GLB パス（省略時は koba.glb）")
    parser.add_argument("--frames",    default=None, type=int, help="重力シミュのフレーム数（0=OFF、省略時は 20）")
    parser.add_argument("--output",    default=None, help="体+ボトムス の出力先（省略時は output/fitted_bottoms.glb）")
    parser.add_argument("--cloth-out", default=None, help="ボトムスのみ の出力先（省略時は output/bottoms_fitted.glb）")
    args = parser.parse_args()

    env = {}
    if args.cloth:
        env["POKEKURO_BOTTOMS_PATH"] = os.path.abspath(args.cloth)
    if args.body:
        env["POKEKURO_BODY_PATH"] = os.path.abspath(args.body)
    if args.frames is not None:
        env["POKEKURO_SIM_FRAMES"] = str(args.frames)
    if args.output:
        env["POKEKURO_OUTPUT_PATH"] = os.path.abspath(args.output)
    if args.cloth_out:
        env["POKEKURO_CLOTH_OUT"] = os.path.abspath(args.cloth_out)

    core = os.path.join(BASE, "pipeline_bottoms.py")

    try:
        blender_run(core, env)
    except SystemExit as e:
        print(json.dumps({"success": False, "error": f"Blender exited with code {e.code}"}))
        raise

    output = env.get("POKEKURO_OUTPUT_PATH", os.path.join(ROOT, "output", "fitted_bottoms.glb"))
    cloth_out = env.get("POKEKURO_CLOTH_OUT", os.path.join(ROOT, "output", "bottoms_fitted.glb"))

    if not os.path.exists(output) or not os.path.exists(cloth_out):
        print(json.dumps({"success": False, "error": "出力ファイルが生成されませんでした"}))
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"[bottoms] DONE  →  {output}")
    print(f"{'='*60}\n")
    print(json.dumps({"success": True, "output_path": output, "cloth_path": cloth_out}))


if __name__ == "__main__":
    main()
