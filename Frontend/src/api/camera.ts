import { cameraSimulationImages } from "../data/mockData";

/**
 * カメラ撮影シミュレーション用の画像一覧を取得します。
 * 将来的にサーバー等から画像一覧を取得する場合は、ここを非同期処理に変更可能です。
 */
export function getCameraSimulationImages(): any[] {
  return cameraSimulationImages;
}
