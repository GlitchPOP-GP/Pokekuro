"""
autofit.py (v23)
1. BBox でスケール・位置合わせ
2. Shrinkwrap で体表面に密着（貫通防止）
"""

import bpy
import bmesh
import os

import os as _os
_BASE        = _os.path.dirname(_os.path.abspath(__file__))
BODY_PATH    = _os.environ.get("POKEKURO_BODY_PATH",  _os.path.join(_BASE, "koba.glb"))
CLOTH_PATH   = _os.environ.get("POKEKURO_CLOTH_PATH", _os.path.join(_BASE, "cloth.glb"))
CLOTH_FITTED = _os.path.join(_BASE, "output", "cloth_fitted.glb")

# 体より少し外側に服を配置するオフセット（メートル）
SHRINKWRAP_OFFSET = 0.015
# BBox スケール時の余裕（Shrinkwrap が縮めるので 1.0 で OK）
EASE = 1.0


def get_combined_bbox(objs):
    all_verts = []
    for obj in objs:
        mat = obj.matrix_world
        all_verts += [mat @ v.co for v in obj.data.vertices]
    xs = [v.x for v in all_verts]
    ys = [v.y for v in all_verts]
    zs = [v.z for v in all_verts]
    return {
        "width"   : max(xs) - min(xs),
        "height"  : max(zs) - min(zs),
        "depth"   : max(ys) - min(ys),
        "center_x": (max(xs) + min(xs)) / 2,
        "center_y": (max(ys) + min(ys)) / 2,
        "center_z": (max(zs) + min(zs)) / 2,
    }


# =====================================
# 1. 体をインポート（Shrinkwrap 用に残す）
# =====================================

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=BODY_PATH)
bpy.context.view_layer.update()

body_meshes = [o for o in bpy.data.objects if o.type == "MESH"]
upper_meshes = [o for o in body_meshes if "body" in o.name.lower()] or body_meshes
upper_box = get_combined_bbox(upper_meshes)

print(f"[fit] Body bbox: W={upper_box['width']:.3f} H={upper_box['height']:.3f} D={upper_box['depth']:.3f}")

# join() 前に Z 範囲を計算しておく（join 後は参照が無効になる）
_all_body_verts = []
for obj in body_meshes:
    mat = obj.matrix_world
    _all_body_verts += [mat @ v.co for v in obj.data.vertices]
body_z_min = min(v.z for v in _all_body_verts)
body_z_max = max(v.z for v in _all_body_verts)
body_height = body_z_max - body_z_min

print(f"[fit] Body Z: min={body_z_min:.3f} max={body_z_max:.3f} height={body_height:.3f}")

# Shrinkwrap のターゲットとして結合した単一メッシュを作る
bpy.ops.object.select_all(action='DESELECT')
for obj in body_meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = body_meshes[0]
if len(body_meshes) > 1:
    bpy.ops.object.join()
bpy.context.view_layer.update()
body_target = [o for o in bpy.data.objects if o.type == "MESH"][0]
body_target.name = "_body_target"

# =====================================
# 2. 服をインポート・結合
# =====================================

bpy.ops.import_scene.gltf(filepath=CLOTH_PATH)
bpy.context.view_layer.update()

cloth_meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.name != "_body_target"]
if len(cloth_meshes) > 1:
    bpy.ops.object.select_all(action='DESELECT')
    for obj in cloth_meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = cloth_meshes[0]
    bpy.ops.object.join()
    bpy.context.view_layer.update()

cloth = [o for o in bpy.data.objects if o.type == "MESH" and o.name != "_body_target"][0]
cloth_box = get_combined_bbox([cloth])

print(f"[fit] Cloth bbox: W={cloth_box['width']:.3f} H={cloth_box['height']:.3f} D={cloth_box['depth']:.3f}")

# =====================================
# 3. BBox スケール・位置合わせ
#    幅だけで合わせて服の縦横比を保持する。
#    縦位置は体の胴体中央（全身高さの 65%）に合わせる。
# =====================================

bm = bmesh.new()
bm.from_mesh(cloth.data)

# 幅のみでスケール（高さで合わせると上半身服が全身に引き伸ばされる）
scale = upper_box["width"] / cloth_box["width"] * EASE

for v in bm.verts:
    v.co *= scale

xs = [v.co.x for v in bm.verts]
ys = [v.co.y for v in bm.verts]
zs = [v.co.z for v in bm.verts]

# 胴体中央 = 全身高さの下から 65% の位置
torso_center_z = body_z_min + body_height * 0.65

dx = upper_box["center_x"] - (max(xs) + min(xs)) / 2
dy = upper_box["center_y"] - (max(ys) + min(ys)) / 2
dz = torso_center_z         - (max(zs) + min(zs)) / 2

for v in bm.verts:
    v.co.x += dx
    v.co.y += dy
    v.co.z += dz

print(f"[fit] Scale={scale:.4f}  TorsoCenterZ={torso_center_z:.4f}  Offset=({dx:.4f}, {dy:.4f}, {dz:.4f})")

bm.to_mesh(cloth.data)
bm.free()
cloth.data.update()
bpy.context.view_layer.update()

# =====================================
# 4. Shrinkwrap — 上半身のみをターゲットにして密着
# =====================================

print("[fit] Building upper-body target for Shrinkwrap ...")

# 体の上半分（ウエスト以上）だけの頂点を残した一時メッシュを作る
import bmesh as _bmesh2
waist_z = body_z_min + body_height * 0.45  # 全身高さの 45% 以上 = 上半身

bm_upper = _bmesh2.new()
bm_upper.from_mesh(body_target.data)
# ウエスト以下の頂点を削除
verts_to_del = [v for v in bm_upper.verts if (body_target.matrix_world @ v.co).z < waist_z]
_bmesh2.ops.delete(bm_upper, geom=verts_to_del, context='VERTS')

upper_mesh_data = bpy.data.meshes.new("_upper_body_mesh")
bm_upper.to_mesh(upper_mesh_data)
bm_upper.free()

upper_body_obj = bpy.data.objects.new("_upper_body", upper_mesh_data)
bpy.context.collection.objects.link(upper_body_obj)
bpy.context.view_layer.update()

print(f"[fit] Shrinkwrap target: upper body (waist_z={waist_z:.3f})")

bpy.context.view_layer.objects.active = cloth
cloth.select_set(True)

# 胴体のみに Shrinkwrap をかける頂点グループを作成
# 体の幅の 30% 以内 = 胴体、それ以上 = 袖 として重みをグラデーション
vg = cloth.vertex_groups.new(name="sw_torso")
torso_half = upper_box["width"] * 0.30  # 胴体とみなす X 距離（中心から）
sleeve_half = upper_box["width"] * 0.42 # 袖とみなす X 距離（これ以上は重み 0）

for v in cloth.data.vertices:
    world_co = cloth.matrix_world @ v.co
    abs_x = abs(world_co.x - upper_box["center_x"])
    if abs_x <= torso_half:
        w = 1.0
    elif abs_x >= sleeve_half:
        w = 0.0
    else:
        # グラデーション
        w = 1.0 - (abs_x - torso_half) / (sleeve_half - torso_half)
    vg.add([v.index], w, 'REPLACE')

sw = cloth.modifiers.new("Shrinkwrap", "SHRINKWRAP")
sw.target           = upper_body_obj
sw.offset           = SHRINKWRAP_OFFSET
sw.wrap_method      = 'NEAREST_SURFACEPOINT'
sw.wrap_mode        = 'ON_SURFACE'
sw.vertex_group     = "sw_torso"

bpy.ops.object.modifier_apply(modifier="Shrinkwrap")
bpy.context.view_layer.update()

# 頂点グループ・一時オブジェクトを削除
existing_vg = cloth.vertex_groups.get("sw_torso")
if existing_vg:
    cloth.vertex_groups.remove(existing_vg)
bpy.data.objects.remove(upper_body_obj, do_unlink=True)

print(f"[fit] Shrinkwrap applied (offset={SHRINKWRAP_OFFSET}m)")

# =====================================
# 5. 体ターゲットを削除してエクスポート
# =====================================

bpy.data.objects.remove(body_target, do_unlink=True)
bpy.context.view_layer.update()

os.makedirs(os.path.dirname(CLOTH_FITTED), exist_ok=True)

bpy.ops.object.select_all(action='DESELECT')
cloth.select_set(True)
bpy.context.view_layer.objects.active = cloth

bpy.ops.export_scene.gltf(
    filepath=CLOTH_FITTED,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
print(f"[fit] Exported -> {CLOTH_FITTED}")
print("[fit] Next: cloth_modifier.py")
