"""
pipeline_core.py  (v4 — 最小処理)

これまでの教訓:
  細分化・多重スムージング・物理シミュ・自己コリジョンを盛るほど
  メッシュが膨張・溶解して「ぐちゃぐちゃ」になった。
  元の Meshy スキャン服はそれ自体きれいなので、極力いじらない。

処理（最小限）:
  1.   インポート・結合
  2.   スケール・位置合わせ（幅基準・縦横比保持）
  2.5  袖の軸をアバターの腕の軸に重ねる（長さ・断面不変の yz 補正）
  3.   クリーンアップ（重複除去・法線再計算のみ）
  3.5  重力シミュ 少しだけ（高剛性・自己コリジョンなし・数フレーム）
  4.   OUTSIDE Shrinkwrap 1回だけ（体内側に入った頂点だけ最小移動で押し出す）
  5.   エクスポート
       output/fitted.glb       — 体 + 服（ブラウザ検証・アプリ表示用）
       output/cloth_fitted.glb — 服のみ（アプリ側で服を切り替える用）
"""

import bpy
import bmesh
import os

_BASE       = os.path.dirname(os.path.abspath(__file__))
_ROOT       = os.path.dirname(_BASE)
BODY_PATH   = os.environ.get("POKEKURO_BODY_PATH",  os.path.join(_ROOT, "assets", "koba.glb"))
CLOTH_PATH  = os.environ.get("POKEKURO_CLOTH_PATH", os.path.join(_ROOT, "assets", "cloth.glb"))
OUTPUT_PATH = os.environ.get("POKEKURO_OUTPUT_PATH",
                             os.path.join(_ROOT, "output", "fitted.glb"))
CLOTH_OUT   = os.environ.get("POKEKURO_CLOTH_OUT",
                             os.path.join(_ROOT, "output", "cloth_fitted.glb"))

EASE        = 0.9    # スケール余裕
TORSO_RATIO = 0.66   # 服の中心を体の下から何%の高さに
SW_OFFSET   = 0.018  # OUTSIDE Shrinkwrap オフセット（密着度）
                     # 頂点単位の保証なので、細い指先が三角形の面中央を
                     # すり抜けないよう布の厚み＋余裕を持たせる
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
# 2. スケール・位置合わせ
# ══════════════════════════════════════════════════════
print("[2] scale & position ...")
scale   = (body_bb["w"] / cloth_bb["w"]) * EASE
torso_z = body_bb["zmin"] + body_bb["h"] * TORSO_RATIO

bm = bmesh.new(); bm.from_mesh(cloth.data)
for v in bm.verts:
    v.co *= scale
xs = [v.co.x for v in bm.verts]; ys = [v.co.y for v in bm.verts]; zs = [v.co.z for v in bm.verts]
dx = body_bb["cx"] - (max(xs)+min(xs))/2
dy = body_bb["cy"] - (max(ys)+min(ys))/2
dz = torso_z       - (max(zs)+min(zs))/2
for v in bm.verts:
    v.co.x += dx; v.co.y += dy; v.co.z += dz
bm.to_mesh(cloth.data); bm.free(); cloth.data.update()
bpy.context.view_layer.update()
print(f"    scale={scale:.4f}  dz={dz:.4f}")


# ══════════════════════════════════════════════════════
# 2.5 袖の軸をアバターの腕の軸に重ねる
#   服の袖は腕に対して傾き＋位置ずれがあり（例: 前方傾き＋前下方オフセット）、
#   そのままだと手が袖の面を突き抜ける。
#   腕の軸（体）と袖の軸（服）を 2 箇所のスラブ重心で検出し、
#   x に対して線形の yz 補正で袖の中心線を腕の中心線に一致させる。
#   x は動かさない＝袖の長さ不変。yz は平行移動のみ＝断面形状も不変。
# ══════════════════════════════════════════════════════
print("[2.5] align sleeve axis to arm axis ...")
from mathutils import Vector

cx = body_bb["cx"]
bw = body_bb["w"] / 2   # 体の半幅（体中心→指先）
SHOULDER = 0.16   # この x 距離より外側を「袖」とみなす（中心から）
BLEND    = 0.08   # 肩の継ぎ目をなめらかにする幅

def slab_axis(obj, sign, t0, t1):
    """中心から (x-cx)*sign が [t0,t1] の頂点群の「範囲中央」(midrange)。
    重心だと頂点密度（指は密）に引きずられるので、
    覆うべき範囲の中心＝ (min+max)/2 を使う。"""
    ys = []; zs = []
    for v in obj.data.vertices:
        co = obj.matrix_world @ v.co
        t = (co.x - cx) * sign
        if t0 <= t <= t1:
            ys.append(co.y); zs.append(co.z)
    if not ys:
        return None
    return Vector((0.0, (min(ys)+max(ys))/2, (min(zs)+max(zs))/2))

for sign in (+1, -1):
    # 腕・袖しか存在しない x 領域で軸を 3 点サンプリング
    # （手は先端に向かって後方にカーブするため、2点の直線では小指側が覆えない）
    stations = [
        (0.42 * bw, 0.52 * bw),   # 上腕〜肘
        (0.68 * bw, 0.80 * bw),   # 手首
        (0.86 * bw, 1.00 * bw),   # 手（小指の先まで）
    ]
    bs = [slab_axis(body,  sign, a, b) for a, b in stations]
    cs = [slab_axis(cloth, sign, a, b) for a, b in stations]
    if not all(bs + cs):
        print(f"    side {sign}: skip (no verts)")
        continue
    ts = [(a + b) / 2 for a, b in stations]
    ds = [b_ - c_ for b_, c_ in zip(bs, cs)]   # 各点での袖→腕オフセット（yz のみ使用）

    def offset_at(t):
        """区分線形補間（外側は外挿）"""
        if t <= ts[1]:
            i, j = 0, 1
        else:
            i, j = 1, 2
        f = (t - ts[i]) / (ts[j] - ts[i])
        dy = ds[i].y + f * (ds[j].y - ds[i].y)
        dz = ds[i].z + f * (ds[j].z - ds[i].z)
        return dy, dz

    bm = bmesh.new(); bm.from_mesh(cloth.data)
    moved = 0
    for v in bm.verts:
        t = (v.co.x - cx) * sign
        if t <= SHOULDER:
            continue
        w = min(1.0, (t - SHOULDER) / BLEND)   # 継ぎ目はなめらかに部分適用
        dy, dz = offset_at(t)
        v.co.y += dy * w
        v.co.z += dz * w
        moved += 1
    bm.to_mesh(cloth.data); bm.free(); cloth.data.update()
    print(f"    side {sign}: elbow(dy={ds[0].y:+.3f},dz={ds[0].z:+.3f}) "
          f"wrist(dy={ds[1].y:+.3f},dz={ds[1].z:+.3f}) "
          f"hand(dy={ds[2].y:+.3f},dz={ds[2].z:+.3f})  moved={moved}")

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
# 3.5 Cloth Simulation（cloth_modifier.py 参考）
#   剛性・コリジョン厚・弱重力・フレーム数は cloth_modifier.py の実績値。
#   ただし崩壊要因の 2 点のみ変更:
#     - 自己コリジョン OFF（実測で服全体が丸まり袖口が崩壊した）
#     - 袖口の先端＋襟元だけピン留め（カフ潰れ・ずり落ち防止）
#   細分化はしない（メッシュ溶解の原因・HANDOFF 制約）。
#   貫通は直後の OUTSIDE Shrinkwrap が保証。
# ══════════════════════════════════════════════════════
if SIM_FRAMES > 0:
    print(f"[3.5] cloth simulation ({SIM_FRAMES} frames) ...")
    # 体に Collision Modifier（bpy.types.CollisionModifier）
    activate(body)
    col_mod = body.modifiers.new("Collision", "COLLISION")
    col_mod.settings.thickness_outer = 0.008   # 厚いと布が体から浮いたまま「着地」してしまう
    col_mod.settings.thickness_inner = 0.005
    print(f"    body modifier : {type(col_mod).__name__}")

    # シミュ前に緩い OUTSIDE Shrinkwrap を1回:
    # 布が首・頭など体の内部に入ったままシミュを始めると
    # コリジョンに捕まって表面に張り付く（頭にくっつく）ため、
    # 全ての布を体の外側に出してからソルバーに渡す。
    activate(cloth)
    pre = cloth.modifiers.new("PreSW", "SHRINKWRAP")
    pre.target      = body
    pre.offset      = 0.012
    pre.wrap_method = 'NEAREST_SURFACEPOINT'
    pre.wrap_mode   = 'OUTSIDE'
    bpy.ops.object.modifier_apply(modifier="PreSW")

    # 袖口の先端のみピン留め（襟はピンしない＝重力で自然に肩へ落とす）
    pin = cloth.vertex_groups.new(name="PIN")
    for v in cloth.data.vertices:
        t = abs(v.co.x - cx)
        w_cuff = max(0.0, min(1.0, (t - 0.78 * bw) / (0.10 * bw)))
        if w_cuff > 0:
            pin.add([v.index], w_cuff, 'REPLACE')

    # 服に Cloth Modifier（bpy.types.ClothModifier）
    activate(cloth)
    cloth_mod = cloth.modifiers.new("Cloth", "CLOTH")
    print(f"    cloth modifier: {type(cloth_mod).__name__} "
          f"(settings={type(cloth_mod.settings).__name__}, "
          f"collision_settings={type(cloth_mod.collision_settings).__name__})")

    s = cloth_mod.settings
    s.quality = 12          # 高品質（貫通しにくい）
    s.mass = 0.3
    s.tension_stiffness     = 40
    s.compression_stiffness = 40
    s.shear_stiffness       = 20
    s.bending_stiffness     = 15.0   # 5だと皺が多すぎて布の塊に見える → 厚手ジャケットの張りを出す
    s.vertex_group_mass = "PIN"

    cloth_mod.collision_settings.use_collision = True
    cloth_mod.collision_settings.distance_min = 0.006   # 浮きを防ぐため布の厚み程度に

    cloth_mod.collision_settings.use_self_collision = False   # 実測で崩壊の原因 → OFF

    # 重力は通常の -9.81（袖の垂れはピン留めが防ぐ）。
    # 弱重力だと布が肩・腕の上面に届かず浮いたままになる。

    # フレームを進めるたびに Blender 内蔵ソルバー（C/C++実装）が布を計算する。
    # 各フレームでソルバーが動かした量を実測して出力（＝シミュ実行の証拠）
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = SIM_FRAMES
    base = [v.co.copy() for v in cloth.data.vertices]
    for f in range(1, SIM_FRAMES + 1):
        scene.frame_set(f)
        deps = bpy.context.evaluated_depsgraph_get()
        ev_mesh = cloth.evaluated_get(deps).to_mesh()
        idx = range(0, len(ev_mesh.vertices), 40)   # サンプリングして平均移動量を計測
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
m.wrap_mode   = 'OUTSIDE'      # 体内側の頂点だけ表面へ。外側は不動＝形保持
bpy.ops.object.modifier_apply(modifier="SW")
bpy.context.view_layer.update()
print("    done")


# ══════════════════════════════════════════════════════
# 4.5 裾のボトムス用クリアランス
#   上下の服は別ファイルで生成し、アプリ側で重ねて着せ替える。
#   ボトムスは体表面+約2.5cm に載るため、腰から下のジャケットは
#   体からの距離を余分に確保しておかないと、後から重ねたボトムスが
#   ジャケットを突き抜ける。
#   → 腰より下だけオフセット大きめの OUTSIDE Shrinkwrap を 1 回。
#     境目は頂点グループのグラデーションでなめらかに。
# ══════════════════════════════════════════════════════
print("[4.5] hem clearance for bottoms ...")
PANTS_CLEARANCE = 0.045   # 腰から下の体→ジャケット最小距離（パンツの厚み+余裕）
waist_z = body_bb["zmin"] + 0.54 * body_bb["h"]   # パンツのウエスト上端より少し上

hem = cloth.vertex_groups.new(name="HEM")
n_hem = 0
for v in cloth.data.vertices:
    w = max(0.0, min(1.0, ((waist_z + 0.10) - v.co.z) / 0.10))
    if w > 0:
        hem.add([v.index], w, 'REPLACE')
        n_hem += 1

m = cloth.modifiers.new("SWHEM", "SHRINKWRAP")
m.target       = body
m.offset       = PANTS_CLEARANCE
m.wrap_method  = 'NEAREST_SURFACEPOINT'
m.wrap_mode    = 'OUTSIDE'
m.vertex_group = "HEM"
bpy.ops.object.modifier_apply(modifier="SWHEM")
bpy.context.view_layer.update()
print(f"    hem verts: {n_hem}  clearance: {PANTS_CLEARANCE}")


# ══════════════════════════════════════════════════════
# 5. エクスポート
# ══════════════════════════════════════════════════════
print("[5] export ...")
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# 服のみ（アプリ側の着せ替え切替用）
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

# 体 + 服（最終出力・ブラウザ検証用）
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
