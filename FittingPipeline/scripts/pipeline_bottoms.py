"""
pipeline_bottoms.py — ボトムス用パイプライン
上着用 pipeline_core.py と全く同じ手法をボトムスに適用したもの。

処理:
  1.   インポート・結合
  2.   スケール（ウエスト幅基準・縦横比保持）・位置合わせ（腰）
  2.5  脚の軸をアバターの脚の軸に重ねる（z ごとの xy 区分線形補正・長さ不変）
  3.   クリーンアップ（重複除去・法線再計算のみ）
  3.5  事前 OUTSIDE Shrinkwrap → Cloth Simulation（ウエスト＋裾口ピン留め）
  4.   OUTSIDE Shrinkwrap 1回（貫通除去・最小移動）
  5.   エクスポート
       output/fitted_bottoms.glb   — 体 + ボトムス（ブラウザ検証用）
       output/bottoms_fitted.glb   — ボトムスのみ（アプリ切替用）
"""

import bpy
import bmesh
import os
from mathutils import Vector

_BASE       = os.path.dirname(os.path.abspath(__file__))
_ROOT       = os.path.dirname(_BASE)
BODY_PATH   = os.environ.get("POKEKURO_BODY_PATH",    os.path.join(_ROOT, "assets", "koba.glb"))
CLOTH_PATH  = os.environ.get("POKEKURO_BOTTOMS_PATH", os.path.join(_ROOT, "assets", "bottomscloth.glb"))
OUTPUT_PATH = os.environ.get("POKEKURO_OUTPUT_PATH",
                             os.path.join(_ROOT, "output", "fitted_bottoms.glb"))
CLOTH_OUT   = os.environ.get("POKEKURO_CLOTH_OUT",
                             os.path.join(_ROOT, "output", "bottoms_fitted.glb"))

EASE        = 1.10   # ウエストのスケール余裕（ぶかぶで OK）
WAIST_RATIO = 0.52   # 服のウエスト上端を体の下から何%の高さに
HEM_RATIO   = float(os.environ.get("POKEKURO_HEM_RATIO", "0.005"))
                     # 裾を体の下から何%の高さで終わらせるか（縦方向の長さ調整用）
                     # 値を小さくするほど裾が下がり丈が長くなる（0 = 体の最下点＝足裏の高さ）
SW_OFFSET   = 0.018  # OUTSIDE Shrinkwrap オフセット
                     # （頂点単位の保証なので、つま先などが面中央を
                     #   すり抜けないよう布の厚み＋余裕を持たせる）
SIM_FRAMES  = int(os.environ.get("POKEKURO_SIM_FRAMES", "20"))  # 重力シミュのフレーム数（0=OFF）


def get_bbox(obj):
    mat = obj.matrix_world
    vs = [mat @ v.co for v in obj.data.vertices]
    xs = [v.x for v in vs]; ys = [v.y for v in vs]; zs = [v.z for v in vs]
    return {
        "w": max(xs)-min(xs), "h": max(zs)-min(zs), "d": max(ys)-min(ys),
        "cx": (max(xs)+min(xs))/2, "cy": (max(ys)+min(ys))/2, "cz": (max(zs)+min(zs))/2,
        "zmin": min(zs), "zmax": max(zs),
    }


def apply_transforms(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def activate(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def slab_stats(obj, z0, z1, sign=None, cx=0.0):
    """z が [z0,z1]（sign 指定時はさらに x 側で絞る）の頂点の
    midrange (x,y) と x 幅を返す"""
    xs = []; ys = []
    for v in obj.data.vertices:
        co = obj.matrix_world @ v.co
        if not (z0 <= co.z <= z1):
            continue
        if sign is not None and (co.x - cx) * sign <= 0.005:
            continue
        xs.append(co.x); ys.append(co.y)
    if not xs:
        return None
    return {
        "mx": (min(xs)+max(xs))/2, "my": (min(ys)+max(ys))/2,
        "w": max(xs)-min(xs),
    }


# ══════════════════════════════════════════════════════
# 1. インポート・結合
# ══════════════════════════════════════════════════════
print("\n[1] import ...")
bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.import_scene.gltf(filepath=BODY_PATH)
bpy.context.view_layer.update()
body_objs = [o for o in bpy.data.objects if o.type == "MESH"]

bpy.ops.import_scene.gltf(filepath=CLOTH_PATH)
bpy.context.view_layer.update()
cloth_objs = [o for o in bpy.data.objects if o.type == "MESH" and o not in body_objs]

if len(cloth_objs) > 1:
    bpy.ops.object.select_all(action='DESELECT')
    for o in cloth_objs: o.select_set(True)
    bpy.context.view_layer.objects.active = cloth_objs[0]
    bpy.ops.object.join()
    bpy.context.view_layer.update()
cloth = [o for o in bpy.data.objects if o.type == "MESH" and o not in body_objs][0]

bpy.ops.object.select_all(action='DESELECT')
for o in body_objs: o.select_set(True)
bpy.context.view_layer.objects.active = body_objs[0]
if len(body_objs) > 1:
    bpy.ops.object.join()
    bpy.context.view_layer.update()
body = [o for o in bpy.data.objects if o.type == "MESH" and o != cloth][0]

apply_transforms(body)
apply_transforms(cloth)
bpy.context.view_layer.update()

body_bb  = get_bbox(body)
cloth_bb = get_bbox(cloth)
print(f"    body : W={body_bb['w']:.3f} H={body_bb['h']:.3f}")
print(f"    cloth: W={cloth_bb['w']:.3f} H={cloth_bb['h']:.3f}")


# ══════════════════════════════════════════════════════
# 2. スケール（ウエスト幅基準）・位置合わせ（腰）
# ══════════════════════════════════════════════════════
print("[2] scale & position ...")
bh = body_bb["h"]; bzmin = body_bb["zmin"]

# 体の腰: 高さの 42〜50% 帯
hip = slab_stats(body, bzmin + 0.42*bh, bzmin + 0.50*bh)
# 服のウエスト: 上端 10% 帯
ch = cloth_bb["h"]; czmax = cloth_bb["zmax"]
waist = slab_stats(cloth, czmax - 0.10*ch, czmax)

# 幅（x/y）はウエスト比、縦（z）は体の脚の長さ基準で別々にスケールする。
# 等方スケールだと横幅を合わせた分だけ縦も伸び、丈が長くなりすぎるため。
scale_xy = (hip["w"] / waist["w"]) * EASE
target_length = (WAIST_RATIO - HEM_RATIO) * bh
scale_z = target_length / ch
print(f"    hip_w={hip['w']:.3f} waist_w={waist['w']:.3f} scale_xy={scale_xy:.4f}")
print(f"    target_length={target_length:.3f} cloth_h={ch:.3f} scale_z={scale_z:.4f}")

bm = bmesh.new(); bm.from_mesh(cloth.data)
for v in bm.verts:
    v.co.x *= scale_xy
    v.co.y *= scale_xy
    v.co.z *= scale_z
bm.to_mesh(cloth.data); bm.free(); cloth.data.update()
bpy.context.view_layer.update()

# 位置: ウエスト（上端帯）の xy 中心を腰の xy 中心へ、上端 z を WAIST_RATIO 高さへ
cloth_bb = get_bbox(cloth)
waist2 = slab_stats(cloth, cloth_bb["zmax"] - 0.10*cloth_bb["h"], cloth_bb["zmax"])
dx = hip["mx"] - waist2["mx"]
dy = hip["my"] - waist2["my"]
dz = (bzmin + WAIST_RATIO*bh) - cloth_bb["zmax"]
bm = bmesh.new(); bm.from_mesh(cloth.data)
for v in bm.verts:
    v.co.x += dx; v.co.y += dy; v.co.z += dz
bm.to_mesh(cloth.data); bm.free(); cloth.data.update()
bpy.context.view_layer.update()
print(f"    dx={dx:.4f} dy={dy:.4f} dz={dz:.4f}")

cloth_bb = get_bbox(cloth)
cx = body_bb["cx"]


# ══════════════════════════════════════════════════════
# 2.5 脚の軸をアバターの脚の軸に重ねる
#   服の脚は左右に開いている／体の脚はほぼ閉じて直立。
#   袖の軸合わせと同じ手法: 脚だけが存在する z 帯 3 箇所で
#   体と服の midrange を検出し、z に対して区分線形の xy 補正で
#   脚の中心線を一致させる。z は動かさない＝丈不変。
# ══════════════════════════════════════════════════════
print("[2.5] align leg axis to body legs ...")
crotch_z = bzmin + 0.40 * bh   # ここより下を「脚」とみなす
BLEND    = 0.10                # 股の継ぎ目をなめらかにする幅

stations = [
    (bzmin + 0.32*bh, bzmin + 0.39*bh),   # 太もも
    (bzmin + 0.20*bh, bzmin + 0.30*bh),   # 膝
    (bzmin + 0.06*bh, bzmin + 0.16*bh),   # 足首
]

for sign in (+1, -1):
    bs = [slab_stats(body,  z0, z1, sign, cx) for z0, z1 in stations]
    cs = [slab_stats(cloth, z0, z1, sign, cx) for z0, z1 in stations]
    if not all(bs + cs):
        print(f"    side {sign}: skip (no verts)")
        continue
    ts = [(z0 + z1) / 2 for z0, z1 in stations]          # z 高い→低い順
    ds = [(b["mx"] - c["mx"], b["my"] - c["my"]) for b, c in zip(bs, cs)]

    def offset_at(z):
        """区分線形補間（外側は外挿）。ts は降順"""
        if z >= ts[1]:
            i, j = 0, 1
        else:
            i, j = 1, 2
        f = (z - ts[i]) / (ts[j] - ts[i])
        dx = ds[i][0] + f * (ds[j][0] - ds[i][0])
        dy = ds[i][1] + f * (ds[j][1] - ds[i][1])
        return dx, dy

    bm = bmesh.new(); bm.from_mesh(cloth.data)
    moved = 0
    for v in bm.verts:
        if v.co.z >= crotch_z:
            continue
        if (v.co.x - cx) * sign <= 0:
            continue
        w = min(1.0, (crotch_z - v.co.z) / BLEND)   # 股の継ぎ目はなめらかに
        dxv, dyv = offset_at(v.co.z)
        v.co.x += dxv * w
        v.co.y += dyv * w
        moved += 1
    bm.to_mesh(cloth.data); bm.free(); cloth.data.update()
    print(f"    side {sign}: thigh(dx={ds[0][0]:+.3f}) knee(dx={ds[1][0]:+.3f}) "
          f"ankle(dx={ds[2][0]:+.3f},dy={ds[2][1]:+.3f})  moved={moved}")

bpy.context.view_layer.update()


# ══════════════════════════════════════════════════════
# 3. クリーンアップ（最小限・形は変えない）
# ══════════════════════════════════════════════════════
print("[3] clean ...")
bm = bmesh.new(); bm.from_mesh(cloth.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(cloth.data); bm.free(); cloth.data.update()
print(f"    verts: {len(cloth.data.vertices)}")


# ══════════════════════════════════════════════════════
# 3.5 Cloth Simulation（上着と同じ構成）
#   ピン留めは 2 箇所: ウエスト（ずり落ち防止）＋裾口の先端（潰れ防止）。
#   シミュ前に緩い OUTSIDE Shrinkwrap で布を体の外に出してから
#   通常重力で落とし、体（COLLISION）に掛ける。
# ══════════════════════════════════════════════════════
if SIM_FRAMES > 0:
    print(f"[3.5] cloth simulation ({SIM_FRAMES} frames) ...")
    activate(body)
    col_mod = body.modifiers.new("Collision", "COLLISION")
    col_mod.settings.thickness_outer = 0.008
    col_mod.settings.thickness_inner = 0.005
    print(f"    body modifier : {type(col_mod).__name__}")

    # 事前 OUTSIDE Shrinkwrap（体内部に入った布はコリジョンに捕まるため）
    activate(cloth)
    pre = cloth.modifiers.new("PreSW", "SHRINKWRAP")
    pre.target      = body
    pre.offset      = 0.012
    pre.wrap_method = 'NEAREST_SURFACEPOINT'
    pre.wrap_mode   = 'OUTSIDE'
    bpy.ops.object.modifier_apply(modifier="PreSW")

    # ピン留め: ウエスト上端のみ（ずり落ち防止）
    # 裾はピンしない — パンツの裾は下方向に自然に垂れるだけなので
    # 固定すると中間の布だけ落ちて引き裂かれ状になる（実測）
    cb = get_bbox(cloth)
    pin = cloth.vertex_groups.new(name="PIN")
    for v in cloth.data.vertices:
        w_waist = max(0.0, min(1.0, (v.co.z - (cb["zmax"] - 0.10)) / 0.05))
        if w_waist > 0:
            pin.add([v.index], w_waist, 'REPLACE')

    activate(cloth)
    cloth_mod = cloth.modifiers.new("Cloth", "CLOTH")
    print(f"    cloth modifier: {type(cloth_mod).__name__} "
          f"(settings={type(cloth_mod.settings).__name__}, "
          f"collision_settings={type(cloth_mod.collision_settings).__name__})")

    s = cloth_mod.settings
    s.quality = 12
    s.mass = 0.3
    s.tension_stiffness     = 40
    s.compression_stiffness = 40
    s.shear_stiffness       = 20
    s.bending_stiffness     = 15.0   # 厚手の布の張り（皺の出すぎ防止）
    s.vertex_group_mass = "PIN"

    cloth_mod.collision_settings.use_collision = True
    cloth_mod.collision_settings.distance_min = 0.006
    cloth_mod.collision_settings.use_self_collision = False   # 崩壊の原因 → OFF

    # 通常重力 -9.81。弱重力だと布が体に届かず浮いたままになる。
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = SIM_FRAMES
    base = [v.co.copy() for v in cloth.data.vertices]
    for f in range(1, SIM_FRAMES + 1):
        scene.frame_set(f)
        deps = bpy.context.evaluated_depsgraph_get()
        ev_mesh = cloth.evaluated_get(deps).to_mesh()
        idx = range(0, len(ev_mesh.vertices), 40)
        mean = sum((ev_mesh.vertices[i].co - base[i]).length for i in idx) / len(idx)
        vmax = max((ev_mesh.vertices[i].co - base[i]).length for i in idx)
        print(f"    frame {f:2d}: solver moved cloth  mean={mean*100:5.2f}cm  max={vmax*100:5.2f}cm")
        cloth.evaluated_get(deps).to_mesh_clear()
    bpy.ops.object.modifier_apply(modifier="Cloth")

    body.modifiers.remove(body.modifiers["Collision"])
    bpy.context.view_layer.update()
    print("    settled")


# ══════════════════════════════════════════════════════
# 4. OUTSIDE Shrinkwrap 1回（貫通除去・最小移動）
# ══════════════════════════════════════════════════════
print("[4] shrinkwrap (OUTSIDE) ...")
activate(cloth)
m = cloth.modifiers.new("SW", "SHRINKWRAP")
m.target      = body
m.offset      = SW_OFFSET
m.wrap_method = 'NEAREST_SURFACEPOINT'
m.wrap_mode   = 'OUTSIDE'
bpy.ops.object.modifier_apply(modifier="SW")
bpy.context.view_layer.update()
print("    done")


# ══════════════════════════════════════════════════════
# 5. エクスポート
# ══════════════════════════════════════════════════════
print("[5] export ...")
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ボトムスのみ（アプリ側の着せ替え切替用）
bpy.ops.object.select_all(action='DESELECT')
cloth.select_set(True)
bpy.context.view_layer.objects.active = cloth
bpy.ops.export_scene.gltf(
    filepath=CLOTH_OUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
print(f"    cloth only → {CLOTH_OUT}")

# 体 + ボトムス（ブラウザ検証用）
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
cloth.select_set(True)
bpy.context.view_layer.objects.active = cloth
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
print(f"\n✓ DONE → {OUTPUT_PATH}\n")
