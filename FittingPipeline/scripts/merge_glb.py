import pygltflib
import copy
import os

_ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BODY_PATH   = os.path.join(_ROOT, "assets", "koba.glb")
CLOTH_PATH  = os.path.join(_ROOT, "output", "cloth_simulated.glb")
OUTPUT_PATH = os.path.join(_ROOT, "output", "fitted.glb")

body_glb  = pygltflib.GLTF2().load(BODY_PATH)
cloth_glb = pygltflib.GLTF2().load(CLOTH_PATH)

body_bin  = body_glb.binary_blob()
cloth_bin = cloth_glb.binary_blob()

buf_offset      = len(body_bin)
bv_offset       = len(body_glb.bufferViews)
acc_offset      = len(body_glb.accessors)
mat_offset      = len(body_glb.materials)
mesh_offset     = len(body_glb.meshes)
node_offset     = len(body_glb.nodes)
image_offset    = len(body_glb.images)
texture_offset  = len(body_glb.textures)
sampler_offset  = len(body_glb.samplers)

# bufferViews
for bv in cloth_glb.bufferViews:
    bv2 = copy.deepcopy(bv)
    bv2.byteOffset = (bv2.byteOffset or 0) + buf_offset
    bv2.buffer = 0
    body_glb.bufferViews.append(bv2)

# accessors
for acc in cloth_glb.accessors:
    acc2 = copy.deepcopy(acc)
    if acc2.bufferView is not None:
        acc2.bufferView += bv_offset
    body_glb.accessors.append(acc2)

# samplers
for s in cloth_glb.samplers:
    body_glb.samplers.append(copy.deepcopy(s))

# images（bufferView 参照をオフセット）
for img in cloth_glb.images:
    img2 = copy.deepcopy(img)
    if img2.bufferView is not None:
        img2.bufferView += bv_offset
    body_glb.images.append(img2)

# textures（sampler/source をオフセット）
for tex in cloth_glb.textures:
    tex2 = copy.deepcopy(tex)
    if tex2.sampler is not None:
        tex2.sampler += sampler_offset
    if tex2.source is not None:
        tex2.source += image_offset
    body_glb.textures.append(tex2)

# materials（textureInfo の index をオフセット）
def offset_texture_info(ti):
    if ti is not None and ti.index is not None:
        ti2 = copy.deepcopy(ti)
        ti2.index += texture_offset
        return ti2
    return ti

for mat in cloth_glb.materials:
    mat2 = copy.deepcopy(mat)
    if mat2.pbrMetallicRoughness:
        pbr = mat2.pbrMetallicRoughness
        pbr.baseColorTexture         = offset_texture_info(pbr.baseColorTexture)
        pbr.metallicRoughnessTexture = offset_texture_info(pbr.metallicRoughnessTexture)
    mat2.normalTexture   = offset_texture_info(mat2.normalTexture)
    mat2.occlusionTexture = offset_texture_info(mat2.occlusionTexture)
    mat2.emissiveTexture = offset_texture_info(mat2.emissiveTexture)
    body_glb.materials.append(mat2)

# meshes
ATTR_KEYS = ["POSITION", "NORMAL", "TANGENT", "TEXCOORD_0", "TEXCOORD_1",
             "COLOR_0", "JOINTS_0", "WEIGHTS_0"]

for mesh in cloth_glb.meshes:
    mesh2 = copy.deepcopy(mesh)
    for prim in mesh2.primitives:
        if prim.indices is not None:
            prim.indices += acc_offset
        for k in ATTR_KEYS:
            v = getattr(prim.attributes, k, None)
            if v is not None:
                setattr(prim.attributes, k, v + acc_offset)
        if prim.material is not None:
            prim.material += mat_offset
    body_glb.meshes.append(mesh2)

# nodes
for node in cloth_glb.nodes:
    node2 = copy.deepcopy(node)
    if node2.mesh is not None:
        node2.mesh += mesh_offset
    if node2.children:
        node2.children = [c + node_offset for c in node2.children]
    body_glb.nodes.append(node2)

# シーンに cloth ルートノードを追加
cloth_roots = cloth_glb.scenes[cloth_glb.scene or 0].nodes
for n in cloth_roots:
    body_glb.scenes[body_glb.scene or 0].nodes.append(n + node_offset)

# バイナリ結合
merged_bin = body_bin + cloth_bin
body_glb.buffers[0].byteLength = len(merged_bin)
body_glb.set_binary_blob(merged_bin)

body_glb.save(OUTPUT_PATH)
print("MERGED ->", OUTPUT_PATH)