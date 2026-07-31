# Blender は公式 linux-arm64 ビルドが提供されていないため amd64 前提。
# compose 側の `platform: linux/amd64` と対で機能する
# （Apple Silicon では Docker Desktop の Rosetta 経由で動作）。
FROM python:3.11-slim-bookworm

# 元コードが前提としていた Blender 5.0 系の最新パッチに固定する。
#   配布物一覧: https://download.blender.org/release/Blender5.0/
#   別バージョンで焼く例:
#     docker compose build --build-arg BLENDER_VERSION=5.1.0 --build-arg BLENDER_SERIES=5.1
ARG BLENDER_SERIES=5.0
ARG BLENDER_VERSION=5.0.1

# Blender は --background（GUI無し）でも X11 / GL の共有ライブラリを要求する
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl xz-utils ca-certificates \
        libx11-6 libxi6 libxxf86vm1 libxfixes3 libxrender1 libxkbcommon0 \
        libgl1 libegl1 libsm6 libice6 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL \
      "https://download.blender.org/release/Blender${BLENDER_SERIES}/blender-${BLENDER_VERSION}-linux-x64.tar.xz" \
      -o /tmp/blender.tar.xz \
 && mkdir -p /opt/blender \
 && tar -xJf /tmp/blender.tar.xz -C /opt/blender --strip-components=1 \
 && rm /tmp/blender.tar.xz \
 # ライブラリ不足はここで build を失敗させる（実行時まで発覚を遅らせない）
 && /opt/blender/blender --version

ENV BLENDER_PATH=/opt/blender/blender \
    PYTHONUNBUFFERED=1

WORKDIR /pipeline

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts ./scripts
COPY assets  ./assets
COPY server.py .

# api コンテナと共有する作業ディレクトリ。
# compose が同一パスに名前付きボリュームを被せる。
RUN mkdir -p /app/public/generated /app/tmp

EXPOSE 9000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "9000"]
