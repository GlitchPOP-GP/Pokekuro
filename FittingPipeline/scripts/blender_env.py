"""blender_env.py — Blender 実行ファイルの解決（OS非依存）

解決の優先順位:
  1. 環境変数 BLENDER_PATH（コンテナでは /opt/blender/blender が入る）
  2. PATH 上の `blender`
  3. OS ごとの既定インストール先（複数バージョンがあれば新しい順）

以前は各スクリプトに Windows の絶対パスが直書きされていたため、
Windows 以外では動作せず、Blender のバージョンを上げるたびに
7ファイルを書き換える必要があった。
"""

from __future__ import annotations

import glob
import os
import shutil
import sys

_DEFAULT_GLOBS = {
    "win32": [
        r"C:\Program Files\Blender Foundation\Blender *\blender.exe",
    ],
    "darwin": [
        "/Applications/Blender.app/Contents/MacOS/Blender",
        "/Applications/Blender*.app/Contents/MacOS/Blender",
    ],
    "linux": [
        "/opt/blender/blender",
        "/usr/local/bin/blender",
        "/usr/bin/blender",
        "/snap/bin/blender",
    ],
}


def _platform_key() -> str:
    if sys.platform.startswith("win"):
        return "win32"
    if sys.platform == "darwin":
        return "darwin"
    return "linux"


def blender_exe() -> str:
    """Blender 実行ファイルの絶対パスを返す。見つからなければ SystemExit。"""
    env = os.environ.get("BLENDER_PATH")
    if env:
        if not os.path.isfile(env):
            raise SystemExit(
                f"[blender_env] BLENDER_PATH が指すファイルがありません: {env}"
            )
        return env

    on_path = shutil.which("blender")
    if on_path:
        return on_path

    for pattern in _DEFAULT_GLOBS[_platform_key()]:
        # 同一シリーズが複数入っている場合は新しい方を優先する
        for path in sorted(glob.glob(pattern), reverse=True):
            if os.path.isfile(path):
                return path

    raise SystemExit(
        "[blender_env] Blender が見つかりません。\n"
        "  環境変数 BLENDER_PATH に blender 実行ファイルのパスを指定してください。\n"
        "    macOS  : export BLENDER_PATH=/Applications/Blender.app/Contents/MacOS/Blender\n"
        "    Linux  : export BLENDER_PATH=/usr/bin/blender\n"
        "    Windows: set BLENDER_PATH=C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe\n"
        "  （Docker で動かす場合はイメージ内に同梱済みのため設定不要です）"
    )
