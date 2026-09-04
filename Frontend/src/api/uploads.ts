import { getApiBaseUrl, getToken, ApiError } from "./client";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

/**
 * 端末ローカルの file:// URI をサーバーにアップロードし、
 * サーバー上のURL（/uploads/xxx）を返す。
 */
export async function uploadImage(localUri: string): Promise<string> {
  const token = getToken();
  if (!token) throw new ApiError(401, "ログインが必要です");

  const filename = localUri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  let status: number;
  let responseBody: string;

  if (Platform.OS === "web") {
    const fileResponse = await fetch(localUri);
    const blob = await fileResponse.blob();
    const formData = new FormData();
    formData.append("image", blob, filename);

    const response = await fetch(`${getApiBaseUrl()}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    status = response.status;
    responseBody = await response.text();
  } else {
    // SDK 57のFormDataは従来の { uri, name, type } パートを受け付けないため、
    // Expoのネイティブmultipartアップローダーを使用する。
    const response = await FileSystem.uploadAsync(
      `${getApiBaseUrl()}/api/uploads`,
      localUri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "image",
        mimeType: mime,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    status = response.status;
    responseBody = response.body;
  }

  let data: { url?: string; error?: string } | null = null;
  try {
    data = responseBody ? JSON.parse(responseBody) : null;
  } catch {
    throw new ApiError(status, "サーバーから不正な応答が返されました");
  }

  if (status < 200 || status >= 300 || !data?.url) {
    throw new ApiError(status, data?.error || "アップロードに失敗しました");
  }

  return data.url;
}
