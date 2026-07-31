"""
combine_outfit.py — 上下の服を体に同時着用した GLB を合成（プレビュー用）

上下の服は別ファイルで生成され、アプリ側で重ねて着せ替える。
このスクリプトはその見た目を確認するための単純マージのみを行う。
貫通処理は各パイプライン側で完結している:
  - ジャケットは step 4.5 で腰から下に「ボトムス用クリアランス」を
    確保して生成されるため、どのボトムスを重ねても突き抜けない。
  - 服→服の Shrinkwrap はここでは行わない（パンツは閉じた体積で
    ないため誤判定でジャケットが崩壊する — 実測）。

入力:
  output/fitted.glb          — 体 + ジャケット（run_pipeline.py の出力）
  output/bottoms_fitted.glb  — ボトムス単体（run_bottoms.py の出力）
出力:
  output/fitted_full.glb     — 体 + ボトムス + ジャケット

使い方:
  python combine_outfit.py     （Blender を自動起動して実行）
"""
import os

try:
    import bpy  # Blender 内で実行中か判定
except ImportError:
    import subprocess
    from blender_env import blender_exe
    raise SystemExit(subprocess.run(
        [blender_exe(), "--background", "--python", os.path.abspath(__file__)]
    ).returncode)

_BASE       = os.path.dirname(os.path.abspath(__file__))
_ROOT       = os.path.dirname(_BASE)
JACKET_GLB  = os.path.join(_ROOT, "output", "fitted.glb")          # 体 + ジャケット
BOTTOMS_GLB = os.path.join(_ROOT, "output", "bottoms_fitted.glb")  # ボトムスのみ
OUTPUT_PATH = os.path.join(_ROOT, "output", "fitted_full.glb")


print("\n[1] import ...")
bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.import_scene.gltf(filepath=JACKET_GLB)
bpy.context.view_layer.update()
first = [o for o in bpy.data.objects if o.type == "MESH"]

bpy.ops.import_scene.gltf(filepath=BOTTOMS_GLB)
bpy.context.view_layer.update()
print("    meshes:", [o.name for o in bpy.data.objects if o.type == "MESH"])

print("[2] export merged ...")
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o.type == "MESH":
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
print(f"\n✓ DONE → {OUTPUT_PATH}\n")
