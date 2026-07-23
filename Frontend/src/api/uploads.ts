import { getApiBaseUrl, getToken, ApiError } from "./client";

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

  const formData = new FormData();
  // React Native の fetch/FormData は {uri, name, type} 形式のオブジェクトを
  // ファイルパートとして受け付ける（Web の File/Blob とは異なる特有の書き方）。
  formData.append("image", {
    uri: localUri,
    name: filename,
    type: mime,
  } as any);

  const res = await fetch(`${getApiBaseUrl()}/api/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type は自動設定させる（境界文字列が必要なため手動指定しない）
    },
    body: formData,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || "アップロードに失敗しました");
  }

  return data.url as string;
}
