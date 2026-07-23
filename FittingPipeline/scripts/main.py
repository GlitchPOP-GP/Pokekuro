import subprocess
import requests
import time
import os

BLENDER = r"C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"

_BASE = os.path.dirname(os.path.abspath(__file__))
GLB_PATH = os.path.join(os.path.dirname(_BASE), "assets", "avatar.glb")

subprocess.run([
    BLENDER,
    "-b",
    "--python",
    os.path.join(_BASE, "convert.py"),
    "--",
    GLB_PATH
])