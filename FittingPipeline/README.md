# pokekuro 着せ替えパイプライン

詳しい経緯・要件は [docs/HANDOFF_FABLE5.md](docs/HANDOFF_FABLE5.md) を参照。

## ディレクトリ構成

```
yzl3Dmodel/
├── assets/           入力の3Dモデル・画像（koba.glb, cloth.glb, bottomscloth.glb, pic.png ...）
├── scripts/          パイプライン本体・実行ラッパー・レンダリング/生成スクリプト
├── legacy/           旧実装（参考のみ・使用禁止）と過去の出力バックアップ
├── docs/             ハンドオフ資料・レビュー資料
├── output/           パイプラインの出力（fitted.glb など）※ 生成物なのでここは移動していません
├── index.html        ブラウザ確認用の three.js ビューア（output/ を直接参照するためルート直下のまま）
└── .env              Meshy / Gemini の API キー
```

## セットアップ（docker 外で直接動かす場合）


```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # MESHY_API_KEY / GEMINI_API_KEY を記入
```

Blender は `BLENDER_PATH` → PATH 上の `blender` → OS ごとの既定パス
の順に自動検出されます（`scripts/blender_env.py`）。検出できない場合のみ指定してください。

```bash
export BLENDER_PATH=/Applications/Blender.app/Contents/MacOS/Blender   # macOS の例
```

## 使い方

```bash
# 上半身の服をフィット
python scripts/run_pipeline.py
python scripts/run_pipeline.py --cloth assets/custom_cloth.glb --frames 0

# 下半身の服をフィット
python scripts/run_bottoms.py

# 上下を1つのGLBに合成（プレビュー用）
python scripts/combine_outfit.py

# 検証レンダリング
python scripts/render_check.py
python scripts/render_wrist.py
python scripts/render_bottoms.py

# ブラウザで確認
python -m http.server 8000
# → http://localhost:8000  (?glb=output/fitted_bottoms.glb で表示モデル切替可)

# 服の写真 → Meshy 3D化パイプライン（pokekuro アプリの Backend から呼ばれる）
python scripts/gemini_extract.py 写真.jpg output/gemini.png --category shirt
python scripts/meshy_generate.py output/gemini.png assets/cloth.glb
```

