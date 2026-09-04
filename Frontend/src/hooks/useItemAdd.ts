import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { useAppContext } from "../store/AppContent";
import { getCameraSimulationImages } from "../api/camera";
import { createClosetItem, deleteClosetItem } from "../api/closet";
import { createLocation } from "../api/locations";
import { uploadImage } from "../api/uploads";
import {
  createFittingJob,
  getFittingJob,
  approveFittingJob,
  resolveGeminiImageUrl,
  FittingStatus,
  FittingJob,
} from "../api/fittingJobs";
import {
  SEASONS,
  CATEGORY_OPTIONS,
  CATEGORY_LABEL_TO_VALUE,
  updateSeasonTags,
  createClosetItemEntity,
} from "../domain/closet";

interface UseItemAddOptions {
  onConfirmSuccess: () => void;
}

export function useItemAdd({ onConfirmSuccess }: UseItemAddOptions) {
  const { addClosetItem, refreshCloset } = useAppContext();
  const route = useRoute<any>();

  const imageIndex = route.params?.imageIndex ?? 0;
  const imageUri = route.params?.imageUri;

  const simulationImages = getCameraSimulationImages();

  // 選択された画像（カメラで撮影した写真URIがあればそれを使用、なければモック画像）
  const previewImage = imageUri
    ? { uri: imageUri }
    : simulationImages[imageIndex % simulationImages.length];

  // 状態定義
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [shopName, setShopName] = useState<string>("");
  const [locationId, setLocationId] = useState<string | number | undefined>(undefined);
  const [registeringShop, setRegisteringShop] = useState(false);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fittingStatus, setFittingStatus] = useState<FittingStatus | "idle">("idle");
  const [fittingError, setFittingError] = useState<string | null>(null);
  const [pendingApprovalJob, setPendingApprovalJob] = useState<FittingJob | null>(null);
  const [approving, setApproving] = useState(false);
  // "gemini": 承認待ちのプレビュー画像を生成中 / "meshy": 承認後の3Dモデル生成中
  const [fittingPhase, setFittingPhase] = useState<"gemini" | "meshy">("gemini");
  const pollingRef = useRef(false);
  const skippedRef = useRef(false);

  // 季節を選択したとき
  const handleSelectSeason = (season: string) => {
    setSelectedSeason(season);
    setIsSeasonModalOpen(false);
    setTags((prev) => updateSeasonTags(prev, season));
  };

  // 上下カテゴリを選択したとき
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(false);
  };

  // タグを追加
  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (!tags.includes(formatted)) {
      setTags((prev) => [...prev, formatted]);
    }
  };

  // タグを削除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // 店舗登録: 入力された店名 + 端末の現在地（GPS）を locations テーブルに登録する
  const handleRegisterShop = async () => {
    const name = shopName.trim();
    if (!name) {
      Alert.alert("店舗名を入力してください");
      return;
    }
    setRegisteringShop(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "位置情報の権限が必要です",
          "店舗の位置情報を登録するには位置情報へのアクセスを許可してください。"
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const loc = await createLocation(
        name,
        position.coords.latitude,
        position.coords.longitude
      );
      setLocationId(loc.id);
      setShopName(loc.name);
    } catch (err: any) {
      Alert.alert("店舗登録に失敗しました", err?.message ?? String(err));
    } finally {
      setRegisteringShop(false);
    }
  };

  // 3D生成ジョブ（Gemini→Meshy→Blenderフィッティング）の完了までポーリングする
  const pollFittingJob = async (jobId: string | number) => {
    pollingRef.current = true;
    const startedAt = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5分でタイムアウト

    while (pollingRef.current) {
      try {
        const job = await getFittingJob(jobId);
        if (!pollingRef.current) return;
        setFittingStatus(job.status);

        if (job.status === "awaiting_approval") {
          // Gemini生成画像をユーザーに確認してもらうため、ここでポーリングを止める。
          // 続き（Meshy→Blender）は handleApproveGeminiImage が承認後に再開する。
          pollingRef.current = false;
          refreshCloset();
          setPendingApprovalJob(job);
          return;
        }
        if (job.status === "done") {
          pollingRef.current = false;
          refreshCloset();
          if (!skippedRef.current) onConfirmSuccess();
          return;
        }
        if (job.status === "failed") {
          pollingRef.current = false;
          refreshCloset();
          setFittingError(job.error_message ?? "3D生成に失敗しました");
          return;
        }
      } catch (err) {
        console.warn("fitting job のポーリングに失敗しました", err);
      }

      if (Date.now() - startedAt > TIMEOUT_MS) {
        pollingRef.current = false;
        setFittingStatus("failed");
        setFittingError("タイムアウトしました");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  // 3D生成の完了を待たずに次画面へ進む
  const handleSkipFitting = async () => {
    if (skippedRef.current) return;
    skippedRef.current = true;

    // 承認待ちで離れる場合も、サーバー側の後続処理を開始してから画面を閉じる。
    if (pendingApprovalJob) {
      try {
        const job = await approveFittingJob(pendingApprovalJob.id);
        setPendingApprovalJob(null);
        setFittingPhase("meshy");
        setFittingStatus(job.status);
        void pollFittingJob(job.id);
      } catch (err: any) {
        skippedRef.current = false;
        Alert.alert("処理を続行できませんでした", err?.message ?? String(err));
        return;
      }
    }

    // ポーリングはバックグラウンドで継続し、完了時にクローゼットを再取得する。
    onConfirmSuccess();
  };

  // Gemini生成画像を確認し、問題なければ承認してMeshy→Blenderフィッティングへ進める
  const handleApproveGeminiImage = async () => {
    if (!pendingApprovalJob) return;
    setApproving(true);
    try {
      const job = await approveFittingJob(pendingApprovalJob.id);
      setPendingApprovalJob(null);
      setFittingPhase("meshy");
      setFittingStatus(job.status);
      pollFittingJob(job.id);
    } catch (err: any) {
      Alert.alert("承認に失敗しました", err?.message ?? String(err));
    } finally {
      setApproving(false);
    }
  };

  // 確定処理
  const handleConfirm = async () => {
    if (submitting || fittingStatus === "pending" || fittingStatus === "processing") return;
    const itemType = CATEGORY_LABEL_TO_VALUE[selectedCategory] ?? "shirt";

    // ドメイン関数を使って保存用のエンティティデータを作成
    const newClosetItem = createClosetItemEntity(previewImage, tags, shopName, itemType);
    // 画像が URL/URI 文字列で表現できる場合のみバックエンドへ永続化する
    // （require() のモック画像には URL が無いため送らない）。
    const localUri =
      previewImage && typeof previewImage === "object" && "uri" in previewImage
        ? (previewImage as { uri: string }).uri
        : undefined;
    if (localUri) {
      setSubmitting(true);
      let createdItemId: string | undefined;
      try {
        // 端末ローカルの file:// URI はサーバーからは読めないので、
        // 先にアップロードしてサーバー上のURLに変換してから登録する。
        const serverImageUrl = await uploadImage(localUri);
        const createdItem = await createClosetItem({
          image: serverImageUrl,
          name: newClosetItem.name,
          itemType,
          season: selectedSeason || undefined,
          tags,
          locationId,
        });
        createdItemId = createdItem.id;
      } catch (err) {
        console.warn("クローゼット登録の永続化に失敗しました", err);
        Alert.alert(
          "アイテムを保存できませんでした",
          err instanceof Error ? err.message : "通信状態を確認して、もう一度お試しください"
        );
        return;
      } finally {
        setSubmitting(false);
      }

      if (createdItemId) {
        try {
          // 服単体の3Dフィッティング（Gemini→Meshy→Blender）を非同期で開始する。
          // 完了/失敗の検知と画面遷移は pollFittingJob 側が担うので、ここでは待たない。
          const job = await createFittingJob(createdItemId, itemType);
          setFittingPhase("gemini");
          setFittingStatus(job.status);
          refreshCloset();
          void pollFittingJob(job.id);
          return;
        } catch (err) {
          console.warn("フィッティングジョブの開始に失敗しました", err);
          try {
            await deleteClosetItem(createdItemId);
          } catch (deleteError) {
            console.warn("生成開始に失敗したアイテムの削除に失敗しました", deleteError);
          }
          refreshCloset();
          Alert.alert("3D生成を開始できませんでした", "アイテムはFittingには追加されませんでした");
          onConfirmSuccess();
          return;
        }
      }
    }

    if (!localUri) addClosetItem(newClosetItem);

    // 3D生成を開始できなかった場合はそのまま次画面へ
    onConfirmSuccess();
  };

  return {
    previewImage,
    selectedSeason,
    selectedCategory,
    tags,
    shopName,
    setShopName,
    registeringShop,
    isSeasonModalOpen,
    setIsSeasonModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    submitting,
    fittingStatus,
    fittingPhase,
    fittingError,
    pendingApprovalGeminiImageUrl: pendingApprovalJob
      ? resolveGeminiImageUrl(pendingApprovalJob)
      : null,
    approving,
    handleApproveGeminiImage,
    seasons: SEASONS,
    categories: CATEGORY_OPTIONS,
    handleSelectSeason,
    handleSelectCategory,
    handleAddTag,
    handleRemoveTag,
    handleRegisterShop,
    handleConfirm,
    handleSkipFitting,
  };
}
