import bpy
import os

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BODY_PATH = os.path.join(_ROOT, "assets", "koba.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=BODY_PATH)
bpy.context.view_layer.update()

print("===== ALL OBJECTS =====")
for obj in bpy.data.objects:
    print(f"  [{obj.type}] {obj.name}")
    if obj.type == "MESH":
        print(f"    modifiers: {[m.name + '(' + m.type + ')' for m in obj.modifiers]}")
        if obj.parent:
            print(f"    parent: {obj.parent.name} ({obj.parent.type})")
    if obj.type == "ARMATURE":
        print(f"    bones: {[b.name for b in obj.data.bones][:5]} ...")
print("=======================")