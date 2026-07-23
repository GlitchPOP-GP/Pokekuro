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

## 注意点

- 各スクリプトは Blender 実行ファイルのパスを `C:\Program Files\Blender Foundation\Blender 5.0\blender.exe` に固定しています。バージョンが異なる場合は各スクリプト内の `BLENDER` 変数を書き換えてください。
- `scripts/gemini_extract.py` / `scripts/meshy_generate.py` は CLI引数で入出力パスを受け取り、最後に結果を1行のJSONで stdout に出力する（Node.js から subprocess で呼ぶ想定）。旧 `Meshy.py` / `meshy_gen.py`（固定ファイル名の重複コード、`API_KEY`という誤った環境変数名を参照していたバグあり）は `meshy_generate.py` に統合済み。
- `legacy/old_output_backup/` は旧 `3dmodel/` フォルダの中身（過去の出力バックアップ）です。不要なら削除して問題ありません。
