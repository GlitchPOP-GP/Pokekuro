"""手首の接写レンダリング（貫通診断用）

使い方:
  python render_wrist.py     （Blender を自動起動して実行）
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

import math
from mathutils import Vector


def _render_engines():
    """使用するレンダーエンジンの候補を返す。

    POKEKURO_RENDER_ENGINE が指定されていればそれだけを使う。
    Blender 内で実行されるため blender_env は import できない（自己完結させる）。
    """
    explicit = os.environ.get("POKEKURO_RENDER_ENGINE")
    if explicit:
        return (explicit,)
    return ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES')


_BASE  = os.path.dirname(os.path.abspath(__file__))
_ROOT  = os.path.dirname(_BASE)
GLB    = os.path.join(_ROOT, "output", "fitted.glb")
OUTDIR = os.path.join(_ROOT, "output", "render")
os.makedirs(OUTDIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
bpy.context.view_layer.update()

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
all_v = []
for o in meshes:
    all_v += [o.matrix_world @ v.co for v in o.data.vertices]
xs = [v.x for v in all_v]; ys = [v.y for v in all_v]; zs = [v.z for v in all_v]

# 右手先端（X 最大付近）を狙う
xmax = max(xs)
# X 最大付近の頂点群の中心
near = [v for v in all_v if v.x > xmax - 0.25]
cx = sum(v.x for v in near)/len(near)
cy = sum(v.y for v in near)/len(near)
cz = sum(v.z for v in near)/len(near)
target = Vector((cx, cy, cz))
print(f"wrist target = {target}")

# ライト
for rot, e in [((50,0,30),4),((50,0,210),2),((-30,0,120),2)]:
    ld = bpy.data.lights.new("L",'SUN'); ld.energy=e
    lo = bpy.data.objects.new("L",ld)
    lo.rotation_euler=(math.radians(rot[0]),math.radians(rot[1]),math.radians(rot[2]))
    bpy.context.collection.objects.link(lo)

world = bpy.data.worlds.new("W"); bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background") or world.node_tree.nodes.new("ShaderNodeBackground")
out_node = next((n for n in world.node_tree.nodes if n.type == 'OUTPUT_WORLD'), None) \
    or world.node_tree.nodes.new("ShaderNodeOutputWorld")
if not bg_node.outputs[0].links:
    world.node_tree.links.new(bg_node.outputs[0], out_node.inputs[0])
bg_node.inputs[0].default_value = (0.2, 0.2, 0.2, 1)

cam_data = bpy.data.cameras.new("C"); cam = bpy.data.objects.new("C",cam_data)
bpy.context.collection.objects.link(cam); bpy.context.scene.camera = cam

scene = bpy.context.scene
# GPU 無し環境では POKEKURO_RENDER_ENGINE=CYCLES を明示する
for eng in _render_engines():
    try: scene.render.engine = eng; break
    except Exception: continue
scene.render.resolution_x = 700; scene.render.resolution_y = 700

def look_at(o,t):
    o.rotation_euler = (t-o.location).to_track_quat('-Z','Y').to_euler()

r = 0.4
for name, off in {
    "wrist_top":   Vector((0,0,r)),
    "wrist_front": Vector((0,-r,r*0.3)),
    "wrist_back":  Vector((0, r,r*0.3)),
}.items():
    cam.location = target + off
    look_at(cam, target)
    scene.render.filepath = os.path.join(OUTDIR, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("rendered", name)
print("DONE")
