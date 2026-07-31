// バックエンド API との通信を担う薄いラッパー。
//
// ベースURLは EXPO_PUBLIC_API_URL（.env / docker-compose で注入）から取得する。
// 実機で Expo Go を使う場合は localhost は端末自身を指してしまうため、
// 開発PCの LAN IP（HOST_IP）を使う必要がある。docker 経由の起動（npm run dev）
// では start.mjs が HOST_IP を解決して EXPO_PUBLIC_API_URL に埋め込む。
//
// Web版ビルド（Dockerfile.web）では "/" が入る。末尾スラッシュが落ちて "" になり、
// 相対パス＝同一オリジンとして nginx 経由で api に届くため LAN IP に依存しない。

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8001";

// JWT はメモリ上に保持する（アプリ再起動で消える）。
// 永続化したい場合は expo-secure-store / AsyncStorage に置き換える。
let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

export function getApiBaseUrl(): string {
  return BASE_URL;
}

// DB には画像/動画を "/assets/xxx" の相対パスで保存しているため、
// 表示時に API のベースURLを前置して絶対URLに解決する。
// 既に http(s) から始まる場合（外部URL）はそのまま返す。
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return `${BASE_URL}${pathOrUrl}`;
  return pathOrUrl;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export async function api<T = any>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    if (!authToken) throw new ApiError(401, "ログインが必要です");
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.error || `リクエストに失敗しました (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
