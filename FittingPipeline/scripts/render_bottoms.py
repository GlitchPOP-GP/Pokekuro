"""
render_bottoms.py
fitted_bottoms.glb を複数アングル＋足首接写でレンダリング

使い方:
  python render_bottoms.py     （Blender を自動起動して実行）
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
GLB     = os.path.join(_ROOT, "output", "fitted_bottoms.glb")
OUTDIR  = os.path.join(_ROOT, "output", "render_bottoms")
os.makedirs(OUTDIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
bpy.context.view_layer.update()

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
all_v = []
for o in meshes:
    all_v += [o.matrix_world @ v.co for v in o.data.vertices]
xs = [v.x for v in all_v]; ys = [v.y for v in all_v]; zs = [v.z for v in all_v]
center = Vector(((max(xs)+min(xs))/2, (max(ys)+min(ys))/2, (max(zs)+min(zs))/2))
size = max(max(xs)-min(xs), max(zs)-min(zs))
radius = size * 1.5

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

world = bpy.data.worlds.new("W")
bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background") or world.node_tree.nodes.new("ShaderNodeBackground")
out_node = next((n for n in world.node_tree.nodes if n.type == 'OUTPUT_WORLD'), None) \
    or world.node_tree.nodes.new("ShaderNodeOutputWorld")
if not bg_node.outputs[0].links:
    world.node_tree.links.new(bg_node.outputs[0], out_node.inputs[0])
bg_node.inputs[0].default_value = (0.15, 0.15, 0.15, 1)

cam_data = bpy.data.cameras.new("C")
cam = bpy.data.objects.new("C", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam

scene = bpy.context.scene
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES'):
    try:
        scene.render.engine = eng
        break
    except Exception:
        continue
scene.render.resolution_x = 700
scene.render.resolution_y = 800

def look_at(obj, target):
    direction = target - obj.location
    rot = direction.to_track_quat('-Z', 'Y')
    obj.rotation_euler = rot.to_euler()

# 足首付近（z 下部）の接写ターゲット
zmin = min(zs)
low = [v for v in all_v if v.z < zmin + 0.3]
ankle = Vector((sum(v.x for v in low)/len(low),
                sum(v.y for v in low)/len(low),
                sum(v.z for v in low)/len(low)))

views = {
    "front":   (center + Vector((0, -radius, 0)),          center),
    "back":    (center + Vector((0,  radius, 0)),          center),
    "side":    (center + Vector((radius, 0, 0)),           center),
    "front34": (center + Vector((radius*0.7, -radius*0.7, 0)), center),
    "waist":   (center + Vector((0.5, -0.7, 0.1)),         Vector((0, 0, center.z + size*0.02))),
    "ankle_front": (ankle + Vector((0.3, -0.55, 0.15)),    ankle),
    "ankle_back":  (ankle + Vector((0.3,  0.55, 0.15)),    ankle),
}

for name, (pos, target) in views.items():
    cam.location = pos
    look_at(cam, target)
    scene.render.filepath = os.path.join(OUTDIR, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print(f"  rendered {name}")

print("RENDER DONE")
