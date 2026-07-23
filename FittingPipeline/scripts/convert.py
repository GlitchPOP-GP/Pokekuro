import bpy
import sys
import os

argv = sys.argv
argv = argv[argv.index("--") + 1:]

input_glb = argv[0]

# 初期化
bpy.ops.wm.read_factory_settings(use_empty=True)

# GLB読み込み
bpy.ops.import_scene.gltf(filepath=input_glb)

# メッシュだけ取得
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']

# 全選択解除
bpy.ops.object.select_all(action='DESELECT')

# メッシュのみ選択
for obj in meshes:
    obj.select_set(True)

# アクティブ設定
bpy.context.view_layer.objects.active = meshes[0]

# FBX出力
output_fbx = os.path.splitext(input_glb)[0] + ".fbx"

bpy.ops.export_scene.fbx(
    filepath=output_fbx,
    use_selection=True,
    add_leaf_bones=False,
    bake_anim=False
)

print("Exported:", output_fbx)