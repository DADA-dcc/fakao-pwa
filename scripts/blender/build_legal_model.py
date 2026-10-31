# -*- coding: utf-8 -*-
"""
Blender 5.2 headless 建模脚本：法考主题「正义天平 + 法槌」低多边形精修模型。
用法：
  blender --background --python build_legal_model.py -- <输出.glb> <预览.png>
材质：酒红(#6d1b2e) + 金(#c89b3c) 与开屏封面配色一致。
"""
import bpy
import math
import sys
from mathutils import Vector

# ---------- 参数 ----------
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []
GLB_OUT = argv[0] if len(argv) > 0 else r"C:\Users\Krilenxs\Documents\默认项目\fakao-pwa\assets\models\legal.glb"
PNG_OUT = argv[1] if len(argv) > 1 else r"C:\Users\Krilenxs\Documents\默认项目\fakao-pwa\assets\models\legal_preview.png"

# ---------- 清空场景 ----------
bpy.ops.wm.read_factory_settings(use_empty=True)

def srgb2lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex2rgba(h, a=1.0):
    h = h.lstrip('#')
    return (srgb2lin(int(h[0:2], 16)), srgb2lin(int(h[2:4], 16)), srgb2lin(int(h[4:6], 16)), a)

def make_mat(name, hexcol, metallic=0.0, rough=0.4, emission=None, emis_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf is None:
        for n in nt.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                bsdf = n
                break
    bsdf.inputs["Base Color"].default_value = hex2rgba(hexcol)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if emission is not None:
        for key in ("Emission Color", "Emission"):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = hex2rgba(emission)
                break
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emis_strength
    return m

GOLD   = make_mat("Gold",     "#c89b3c", metallic=1.0, rough=0.26)
GOLD_L = make_mat("GoldLight","#e6c877", metallic=1.0, rough=0.20)
BURG   = make_mat("Burgundy", "#5a1524", metallic=0.0, rough=0.5)
BURG_D = make_mat("BurgundyDeep","#340b16", metallic=0.0, rough=0.55)
IVORY  = make_mat("Ivory",    "#ead3a0", metallic=0.2, rough=0.35)

objs = []

def _finish(ob, mat, smooth=True):
    ob.data.materials.append(mat)
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    objs.append(ob)
    return ob

def cyl(name, radius, depth, loc, rot=(0,0,0), mat=GOLD, verts=48, smooth=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth,
                                        location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    return _finish(ob, mat, smooth)

def sph(name, radius, loc, mat=GOLD, seg=32, ring=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=radius, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    return _finish(ob, mat, True)

def cube(name, size, loc, rot=(0,0,0), mat=BURG, smooth=False):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0]/2.0, size[1]/2.0, size[2]/2.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _finish(ob, mat, smooth)

def cone(name, r1, r2, depth, loc, rot=(0,0,0), mat=GOLD, verts=48, smooth=True):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth,
                                    location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    return _finish(ob, mat, smooth)

def torus(name, major, minor, loc, rot=(0,0,0), mat=GOLD, mseg=40, minseg=14):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     location=loc, rotation=rot,
                                     major_segments=mseg, minor_segments=minseg)
    ob = bpy.context.active_object
    ob.name = name
    return _finish(ob, mat, True)

def strut(name, p1, p2, radius, mat=GOLD):
    p1 = Vector(p1); p2 = Vector(p2)
    d = p2 - p1
    length = d.length
    mid = (p1 + p2) / 2.0
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=radius, depth=length, location=mid)
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return _finish(ob, mat, True)

# =====================================================================
# 正义天平 (Scales of Justice)
# =====================================================================
# 底座
cyl("Base_Plate", 0.50, 0.06, (0, 0, 0.03), mat=BURG_D)
cyl("Base_Ring",  0.42, 0.05, (0, 0, 0.075), mat=GOLD)
cone("Plinth",    0.34, 0.20, 0.12, (0, 0, 0.165), mat=BURG)
sph("Plinth_Knob", 0.085, (0, 0, 0.245), mat=GOLD)

# 立柱
cyl("Column", 0.045, 1.35, (0, 0, 0.245 + 0.675), mat=GOLD)
for z in (0.55, 0.95, 1.35):
    torus("Col_Ring_%.2f" % z, 0.055, 0.014, (0, 0, z), mat=GOLD_L)
sph("Fulcrum", 0.095, (0, 0, 1.635), mat=GOLD)

# 横梁
BEAM_Z = 1.635
cyl("Beam", 0.032, 1.55, (0, 0, BEAM_Z), rot=(0, math.radians(90), 0), mat=GOLD)
for x in (-0.775, 0.775):
    sph("Beam_End_%.0f" % (x*1000), 0.05, (x, 0, BEAM_Z), mat=GOLD_L)

# 两个托盘
PAN_Z = 0.80
for sx in (-1, 1):
    bx = 0.66 * sx
    # 链条：从梁端点到托盘三点
    for ang in (90, 210, 330):
        a = math.radians(ang)
        rim = (bx + 0.21*math.cos(a), 0.21*math.sin(a), PAN_Z + 0.02)
        strut("Chain_%d_%d" % (sx, ang), (0.775*sx, 0, BEAM_Z), rim, 0.006, mat=GOLD_L)
    # 盘面
    cyl("Pan_%d" % sx, 0.24, 0.03, (bx, 0, PAN_Z), mat=GOLD, verts=40)
    torus("Pan_Rim_%d" % sx, 0.235, 0.018, (bx, 0, PAN_Z + 0.015), mat=GOLD_L)
    cone("Pan_Bowl_%d" % sx, 0.20, 0.235, 0.06, (bx, 0, PAN_Z - 0.04), mat=BURG, verts=40)

# =====================================================================
# 法槌 (Gavel) —— 放在底座右前方
# =====================================================================
GX, GY, GZ = 0.72, -0.56, 0.17
# 槌头（沿 X 轴）
cyl("Gavel_Head", 0.105, 0.36, (GX, GY, GZ), rot=(0, math.radians(90), 0), mat=BURG, verts=40)
for dx in (-0.17, 0.17):
    cyl("Gavel_Band_%.2f" % dx, 0.115, 0.035, (GX + dx, GY, GZ), rot=(0, math.radians(90), 0), mat=GOLD, verts=40)
# 手柄（沿 Y 轴，指向 -Y）
cyl("Gavel_Handle", 0.026, 0.62, (GX, GY - 0.10, GZ), rot=(math.radians(90), 0, 0), mat=GOLD, verts=24)
sph("Gavel_Pommel", 0.045, (GX, GY - 0.42, GZ), mat=GOLD_L)
# 底座镇纸块
cube("Sound_Block", (0.34, 0.24, 0.06), (GX, GY - 0.02, 0.03), mat=BURG_D)

# ---------- 倒角，让高光更精致 ----------
for ob in list(objs):
    if ob.type != 'MESH':
        continue
    bpy.context.view_layer.objects.active = ob
    try:
        m = ob.modifiers.new("bev", 'BEVEL')
        m.width = 0.006
        m.segments = 2
        m.limit_method = 'ANGLE'
        m.angle_limit = math.radians(45)
        bpy.ops.object.modifier_apply(modifier=m.name)
    except Exception as e:
        print("bevel skipped", ob.name, e)

# ---------- 计算包围盒（世界坐标） ----------
mn = Vector((1e9, 1e9, 1e9))
mx = Vector((-1e9, -1e9, -1e9))
for ob in objs:
    if ob.type != 'MESH':
        continue
    for v in ob.data.vertices:
        w = ob.matrix_world @ v.co
        for i in range(3):
            mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
center = (mn + mx) / 2.0
size = (mx - mn)
maxdim = max(size.x, size.y, size.z)
print("BBOX center", center, "size", size)

# ---------- 世界与灯光（仅用于预览渲染） ----------
world = bpy.data.worlds.new("W")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.96, 0.92, 0.87, 1.0)
bg.inputs[1].default_value = 1.1

def add_light(name, ltype, loc, energy, size=1.0, color=(1,1,1)):
    ld = bpy.data.lights.new(name, ltype)
    ld.energy = energy
    ld.color = color
    if ltype == 'AREA':
        ld.size = size
    lo = bpy.data.objects.new(name, ld)
    lo.location = loc
    bpy.context.scene.collection.objects.link(lo)
    return lo

key = add_light("Key", 'AREA', (2.2, -2.6, 3.2), 800, size=2.5, color=(1.0, 0.96, 0.9))
fill = add_light("Fill", 'AREA', (-2.4, -1.6, 1.6), 220, size=3.0, color=(0.95, 0.9, 1.0))
rim = add_light("Rim", 'AREA', (0.5, 3.0, 2.4), 450, size=2.0, color=(1.0, 0.85, 0.7))
for lo in (key, fill, rim):
    look_dir = center - lo.location
    lo.rotation_euler = look_dir.to_track_quat('-Z', 'Y').to_euler()

# ---------- 相机 ----------
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 50
cam = bpy.data.objects.new("Cam", cam_data)
bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam
dist = maxdim * 2.55
cam.location = center + Vector((0.62, -1.15, 0.5)).normalized() * dist
look_dir = center - cam.location
cam.rotation_euler = look_dir.to_track_quat('-Z', 'Y').to_euler()

# ---------- 渲染设置 ----------
scene = bpy.context.scene
try:
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
except Exception:
    try:
        scene.render.engine = 'BLENDER_EEVEE'
    except Exception:
        scene.render.engine = 'CYCLES'
        scene.cycles.samples = 48
print("ENGINE", scene.render.engine)

try:
    scene.eevee.taa_render_samples = 32
except Exception:
    pass
scene.render.resolution_x = 900
scene.render.resolution_y = 1100
scene.render.film_transparent = False
try:
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
except Exception as e:
    print("view transform set skipped", e)
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = PNG_OUT
try:
    bpy.ops.render.render(write_still=True)
    print("RENDER_OK", PNG_OUT)
except Exception as e:
    print("RENDER_FAIL", e)

# ---------- 导出 glTF/GLB ----------
try:
    bpy.ops.export_scene.gltf(filepath=GLB_OUT, export_format='GLB',
                              use_selection=False, export_apply=True, export_yup=True)
    print("GLTF_OK", GLB_OUT)
except TypeError:
    bpy.ops.export_scene.gltf(filepath=GLB_OUT, export_format='GLB')
    print("GLTF_OK_FALLBACK", GLB_OUT)

print("DONE")
