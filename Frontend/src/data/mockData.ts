// アプリのデータ（クローゼット・投稿・プロフィール・TODAY'S PICK）はすべて
// バックエンド API から取得するようになったため、ここのモックは廃止した。
//
// 唯一残しているのは、実機カメラが使えない環境（シミュレータ等）で
// アイテム追加画面のプレビューに使う「疑似カメラ画像」だけ。
// これは実データではなく開発時のフォールバック用プレースホルダー。
export const cameraSimulationImages = [
  require("../../assets/brown_jacket.png"),
  require("../../assets/blue_track_jacket.png"),
  require("../../assets/cream_jacket.png"),
  require("../../assets/brown_cargo_pants.png"),
  require("../../assets/blue_denim_jeans.png"),
  require("../../assets/brown_baseball_cap.png"),
];
