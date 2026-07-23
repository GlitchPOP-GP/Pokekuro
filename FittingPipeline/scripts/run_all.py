"""
run_all.py — 着せ替えパイプラインを一連の流れで実行

処理:
  1. run_pipeline.py   上半身フィット      → output/fitted.glb, cloth_fitted.glb
  2. run_bottoms.py    下半身フィット      → output/fitted_bottoms.glb, bottoms_fitted.glb
  3. combine_outfit.py 上下合成（プレビュー用） → output/fitted_full.glb
  4. render_check.py   上半身 検証レンダリング
  5. render_wrist.py   手首接写 検証レンダリング
  6. render_bottoms.py 下半身 検証レンダリング

使い方:
  python run_all.py
  python run_all.py --cloth assets/custom_cloth.glb --bottoms assets/custom_pants.glb
  python run_all.py --frames 0        # 上下とも重力シミュOFF
  python run_all.py --skip-render     # レンダリング検証をスキップ（高速）
"""

import subprocess
import sys
import os
import argparse

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
PY = sys.executable


def run_step(name: str, args: list):
    print(f"\n{'#'*60}")
    print(f"# {name}")
    print(f"{'#'*60}")
    result = subprocess.run([PY] + args)
    if result.returncode != 0:
        print(f"[run_all] ERROR: {name} failed (exit {result.returncode})")
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cloth",   default=None, help="上半身の服GLBパス（省略時は assets/cloth.glb）")
    parser.add_argument("--bottoms", default=None, help="下半身の服GLBパス（省略時は assets/bottomscloth.glb）")
    parser.add_argument("--body",    default=None, help="体GLBパス（省略時は assets/koba.glb）")
    parser.add_argument("--frames",  default=None, type=int, help="重力シミュのフレーム数（上下共通・0=OFF）")
    parser.add_argument("--skip-render", action="store_true", help="検証レンダリングをスキップ")
    args = parser.parse_args()

    top_args = [os.path.join(BASE, "run_pipeline.py")]
    if args.cloth:   top_args += ["--cloth", args.cloth]
    if args.body:    top_args += ["--body", args.body]
    if args.frames is not None: top_args += ["--frames", str(args.frames)]
    run_step("1/6 上半身フィット", top_args)

    bottom_args = [os.path.join(BASE, "run_bottoms.py")]
    if args.bottoms: bottom_args += ["--cloth", args.bottoms]
    if args.body:     bottom_args += ["--body", args.body]
    if args.frames is not None: bottom_args += ["--frames", str(args.frames)]
    run_step("2/6 下半身フィット", bottom_args)

    run_step("3/6 上下合成", [os.path.join(BASE, "combine_outfit.py")])

    if not args.skip_render:
        run_step("4/6 上半身レンダリング検証", [os.path.join(BASE, "render_check.py")])
        run_step("5/6 手首接写レンダリング検証", [os.path.join(BASE, "render_wrist.py")])
        run_step("6/6 下半身レンダリング検証", [os.path.join(BASE, "render_bottoms.py")])
    else:
        print("\n[run_all] レンダリング検証はスキップしました（--skip-render）")

    print(f"\n{'='*60}")
    print("[run_all] DONE")
    print(f"  体+上         → {os.path.join(ROOT, 'output', 'fitted.glb')}")
    print(f"  体+下         → {os.path.join(ROOT, 'output', 'fitted_bottoms.glb')}")
    print(f"  体+上+下      → {os.path.join(ROOT, 'output', 'fitted_full.glb')}")
    print(f"  ブラウザ確認  → http://localhost:8000/?glb=output/fitted_full.glb")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
