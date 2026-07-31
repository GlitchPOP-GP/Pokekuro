import subprocess
import requests
import time
import os

from blender_env import blender_exe

_BASE = os.path.dirname(os.path.abspath(__file__))
GLB_PATH = os.path.join(os.path.dirname(_BASE), "assets", "avatar.glb")

subprocess.run([
    blender_exe(),
    "-b",
    "--python",
    os.path.join(_BASE, "convert.py"),
    "--",
    GLB_PATH
])