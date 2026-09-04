import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from "react-native";
import { FittingStatus } from "../api/fittingJobs";

interface Props {
  status: FittingStatus | "idle";
  error: string | null;
  onSkip: () => void;
  onContinue: () => void;
  geminiImageUrl?: string | null;
  approving?: boolean;
  onApprove?: () => void;
  phase?: "gemini" | "meshy";
}

const STATUS_LABEL_BY_PHASE: Record<"gemini" | "meshy", Record<string, string>> = {
  gemini: {
    pending: "順番待ちしています...",
    processing: "プレビューを作成中...",
  },
  meshy: {
    pending: "順番待ちしています...",
    processing: "3Dモデルを生成しています...",
  },
};

function getFriendlyErrorMessage(error: string | null): string {
  if (!error) return "時間をおいて、もう一度お試しください。";

  if (error.includes("API_KEY_INVALID") || error.includes("API key not valid")) {
    return "Gemini APIキーが正しくありません。設定を確認してから再度お試しください。";
  }
  if (error.includes("GEMINI_API_KEY")) {
    return "Gemini APIキーが設定されていません。";
  }
  if (error.includes("MESHY_API_KEY")) {
    return "Meshy APIキーが設定されていません。";
  }

  return "3D生成処理でエラーが発生しました。時間をおいて再度お試しください。";
}

// 服の3D生成（Gemini → Meshy → Blenderフィッティング）の進捗を表示するオーバーレイ。
// 数十秒〜数分かかるため、待つか・スキップして先に進むかを選べるようにしている。
// awaiting_approval のときは Gemini が切り出した画像を表示し、
// ユーザーが確認して承認するまで Meshy/Blender には進めない。
export default function FittingProgressOverlay({
  status,
  error,
  onSkip,
  onContinue,
  geminiImageUrl,
  approving,
  onApprove,
  phase = "gemini",
}: Props) {
  if (status === "idle" || status === "done") return null;

  if (status === "awaiting_approval") {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>生成された画像を確認してください</Text>
          <Text style={styles.subtitle}>この画像で3D化を進めてよいか確認してください</Text>
          {geminiImageUrl ? (
            <Image
              source={{ uri: geminiImageUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 16 }} />
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={onApprove}
            activeOpacity={0.8}
            disabled={approving}
          >
            <Text style={styles.buttonText}>
              {approving ? "承認中..." : "この画像で進める"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.8}>
            <Text style={styles.skipButtonText}>完了を待たずに進む</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {status === "failed" ? (
          <>
            <Text style={styles.errorTitle}>3D生成に失敗しました</Text>
            <Text style={styles.errorMessage}>{getFriendlyErrorMessage(error)}</Text>
            <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.8}>
              <Text style={styles.buttonText}>続ける</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.title}>{STATUS_LABEL_BY_PHASE[phase][status] ?? "処理中..."}</Text>
            <Text style={styles.subtitle}>写真から服を切り出し、アバターに合わせて3D化しています</Text>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.8}>
              <Text style={styles.skipButtonText}>完了を待たずに進む</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  card: {
    width: "80%",
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: "#000",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  skipButton: {
    marginTop: 20,
  },
  skipButtonText: {
    color: "#aaa",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  errorTitle: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  errorMessage: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#111",
    fontWeight: "700",
  },
});
