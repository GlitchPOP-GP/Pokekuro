import math
import bpy
import numpy as np
from pathlib import Path

import os as _os
_BASE      = _os.path.dirname(_os.path.abspath(__file__))
BODY_PATH  = _os.environ.get("POKEKURO_BODY_PATH", _os.path.join(_BASE, "koba.glb"))
CLOTH_PATH = _os.path.join(_BASE, "output", "cloth_fitted.glb")
OUTPUT_PATH = _os.path.join(_BASE, "output", "cloth_simulated.glb")
SIM_FRAMES = int(_os.environ.get("POKEKURO_SIM_FRAMES", "20"))


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    print("[sim] avatar import")
    bpy.ops.import_scene.gltf(filepath=BODY_PATH)

    avatar_meshes = [
        obj for obj in bpy.context.scene.objects
        if obj.type == "MESH"
    ]

    armatures = [
        obj for obj in bpy.context.scene.objects
        if obj.type == "ARMATURE"
    ]

    if not avatar_meshes:
        raise RuntimeError("avatar mesh not found")

    all_z = []

    for obj in avatar_meshes:
        for v in obj.data.vertices:
            all_z.append((obj.matrix_world @ v.co).z)

    avatar_height = max(all_z) - min(all_z)
    avatar_top = max(all_z)

    print(
        f"[sim] avatar height={avatar_height:.3f} "
        f"top={avatar_top:.3f}"
    )

    print("[sim] cloth import")
    bpy.ops.import_scene.gltf(filepath=CLOTH_PATH)

    cloth_obj = _find_cloth_obj(avatar_meshes)

    print("[sim] fix mesh ...")

    import bmesh as _bmesh
    bm = _bmesh.new()
    bm.from_mesh(cloth_obj.data)

    # 重複頂点を削除
    _bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    # ノーマルを外向きに統一（Meshy スキャン品は逆転しやすい）
    _bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    # サブディビジョン（コリジョン解像度を上げる）
    _bmesh.ops.subdivide_edges(
        bm,
        edges=bm.edges,
        cuts=1,
        use_grid_fill=True,
    )

    bm.to_mesh(cloth_obj.data)
    bm.free()
    cloth_obj.data.update()

    dims = _get_dims(cloth_obj)

    print(
        f"[sim] cloth dims "
        f"{dims[0]:.3f} "
        f"{dims[1]:.3f} "
        f"{dims[2]:.3f}"
    )

    # Shrinkwrap 後は向きが揃っているため回転チェックは省略

    # -------------------------
    # Collision
    # -------------------------

    print("[sim] collision")

    for obj in avatar_meshes:
        col = obj.modifiers.new(
            "Collision",
            type="COLLISION"
        )

        col.settings.thickness_outer = 0.025
        col.settings.thickness_inner = 0.005

    # -------------------------
    # Cloth
    # -------------------------

    print("[sim] cloth modifier")

    cloth_mod = cloth_obj.modifiers.new(
        "Cloth",
        type="CLOTH"
    )

    s = cloth_mod.settings

    s.quality = 12          # 高品質（貫通しにくい）
    s.mass = 0.3

    s.tension_stiffness = 40
    s.compression_stiffness = 40

    s.shear_stiffness = 20
    s.bending_stiffness = 5.0  # 曲げ硬さを上げて形崩れを防ぐ

    cloth_mod.collision_settings.use_collision = True
    cloth_mod.collision_settings.distance_min = 0.015  # 厚みと合わせる

    cloth_mod.collision_settings.use_self_collision = True
    cloth_mod.collision_settings.self_distance_min = 0.008

    # -------------------------
    # simulation
    # -------------------------

    # T ポーズ時は重力を弱める（デフォルト -9.81 だと袖が垂れる）
    bpy.context.scene.gravity[2] = -1.0

    print("[sim] start simulation")

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = SIM_FRAMES

    for frame in range(1, SIM_FRAMES + 1):

        bpy.context.scene.frame_set(frame)

        bpy.context.view_layer.update()

        if frame % 10 == 0:
            print(
                f"[sim] {frame}/{SIM_FRAMES}"
            )

    # -------------------------
    # apply result
    # -------------------------

    print("[sim] apply result")

    bpy.context.scene.frame_set(
        SIM_FRAMES
    )

    depsgraph = (
        bpy.context.evaluated_depsgraph_get()
    )

    eval_obj = cloth_obj.evaluated_get(
        depsgraph
    )

    new_mesh = bpy.data.meshes.new_from_object(
        eval_obj
    )

    old_mesh = cloth_obj.data

    cloth_obj.modifiers.clear()

    cloth_obj.data = new_mesh

    bpy.data.meshes.remove(old_mesh)

    # -------------------------
    # Auto Weight（シミュ確定後）
    # -------------------------

    if armatures:
        print("[sim] auto weight ...")
        armature = armatures[0]

        bpy.ops.object.select_all(action='DESELECT')
        armature.select_set(True)
        cloth_obj.select_set(True)
        bpy.context.view_layer.objects.active = armature

        try:
            bpy.ops.object.parent_set(type='ARMATURE_AUTO')
            print("[sim] auto weight success")
        except Exception as e:
            print("[sim] auto weight failed:", str(e))

    # -------------------------
    # export
    # -------------------------

    print("[sim] export")

    bpy.ops.object.select_all(
        action="DESELECT"
    )

    cloth_obj.select_set(True)
    if armatures:
        armatures[0].select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format="GLB",
        use_selection=True,
        export_skins=True,
    )

    print()
    print("DONE")
    print(OUTPUT_PATH)


def _find_cloth_obj(avatar_meshes):

    for obj in reversed(
        list(bpy.context.scene.objects)
    ):
        if (
            obj.type == "MESH"
            and obj not in avatar_meshes
        ):
            return obj

    raise RuntimeError(
        "cloth mesh not found"
    )


def _get_verts(obj):

    return np.array(
        [
            list(obj.matrix_world @ v.co)
            for v in obj.data.vertices
        ]
    )


def _get_dims(obj):

    verts = _get_verts(obj)

    return (
        verts.max(axis=0)
        - verts.min(axis=0)
    )


def _apply_transforms(obj):

    bpy.ops.object.select_all(
        action="DESELECT"
    )

    obj.select_set(True)

    bpy.context.view_layer.objects.active = obj

    bpy.ops.object.transform_apply(
        location=True,
        rotation=True,
        scale=True,
    )


if __name__ == "__main__":
    main()