"""
render_check.py
fitted.glb を複数アングルからレンダリングして目視確認用 PNG を出力

使い方:
  python render_check.py     （Blender を自動起動して実行）
"""
import os

try:
    import bpy  # Blender 内で実行中か判定
except ImportError:
    import subprocess
    BLENDER = r"C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
    raise SystemExit(subprocess.run(
        [BLENDER, "--background", "--python", os.path.abspath(__file__)]
    ).returncode)

import math
from mathutils import Vector

_BASE   = os.path.dirname(os.path.abspath(__file__))
_ROOT   = os.path.dirname(_BASE)
GLB     = os.path.join(_ROOT, "output", "fitted.glb")
OUTDIR  = os.path.join(_ROOT, "output", "render")
os.makedirs(OUTDIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
bpy.context.view_layer.update()

# 全メッシュの bbox 中心と高さ
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
all_v = []
for o in meshes:
    all_v += [o.matrix_world @ v.co for v in o.data.vertices]
xs = [v.x for v in all_v]; ys = [v.y for v in all_v]; zs = [v.z for v in all_v]
center = Vector(((max(xs)+min(xs))/2, (max(ys)+min(ys))/2, (max(zs)+min(zs))/2))
size = max(max(xs)-min(xs), max(zs)-min(zs))
radius = size * 1.5

# ライト
light_data = bpy.data.lights.new("L", 'SUN')
light_data.energy = 4
light = bpy.data.objects.new("L", light_data)
light.rotation_euler = (math.radians(50), 0, math.radians(30))
bpy.context.collection.objects.link(light)
light2_data = bpy.data.lights.new("L2", 'SUN')
light2_data.energy = 2
light2 = bpy.data.objects.new("L2", light2_data)
light2.rotation_euler = (math.radians(50), 0, math.radians(210))
bpy.context.collection.objects.link(light2)

# ワールド背景を明るめのグレーに
world = bpy.data.worlds.new("W")
bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background") or world.node_tree.nodes.new("ShaderNodeBackground")
out_node = next((n for n in world.node_tree.nodes if n.type == 'OUTPUT_WORLD'), None) \
    or world.node_tree.nodes.new("ShaderNodeOutputWorld")
if not bg_node.outputs[0].links:
    world.node_tree.links.new(bg_node.outputs[0], out_node.inputs[0])
bg_node.inputs[0].default_value = (0.15, 0.15, 0.15, 1)

# カメラ
cam_data = bpy.data.cameras.new("C")
cam = bpy.data.objects.new("C", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam

# レンダ設定
scene = bpy.context.scene
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES'):
    try:
        scene.render.engine = eng
        break
    except Exception:
        continue
scene.render.resolution_x = 700
scene.render.resolution_y = 800
scene.render.film_transparent = False

def look_at(obj, target):
    direction = target - obj.location
    rot = direction.to_track_quat('-Z', 'Y')
    obj.rotation_euler = rot.to_euler()

views = {
    "front": (Vector((0, -radius, 0)), Vector((0, 0, size*0.05))),
    "back":  (Vector((0,  radius, 0)), Vector((0, 0, size*0.05))),
    "side":  (Vector((radius, 0, 0)), Vector((0, 0, size*0.05))),
    "front34": (Vector((radius*0.7, -radius*0.7, 0)), Vector((0, 0, size*0.05))),
    # 上面（腕の前方傾きが見える）— 肩の高さを狙う
    "top":   (Vector((0, 0, radius)), Vector((0, 0, 0))),
}

for name, (off, lift) in views.items():
    cam.location = center + off + lift
    look_at(cam, center)
    scene.render.filepath = os.path.join(OUTDIR, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print(f"  rendered {name}")

print("RENDER DONE")
