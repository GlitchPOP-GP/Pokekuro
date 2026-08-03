// バックエンド API との通信を担う薄いラッパー。
//
// ベースURLは「実機が実際に繋がった Metro のホスト」から実行時に組み立てる。
//
// 理由: 以前は EXPO_PUBLIC_API_URL（docker-compose が HOST_IP から埋め込む）
// だけを見ていたが、この値はコンテナ生成時に固定されるため、開発PCの LAN IP が
// 変わるとアプリ側だけ古い IP を掴み続けて通信できなくなっていた。
//
// 一方 Metro のバンドル URL（NativeModules.SourceCode.scriptURL）は
// 「端末が今まさに到達できたアドレス」そのものなので、常に正しい。
// API は同じ開発PC上の別ポートに居るだけなので、ホストを流用すれば良い。
// これは React Native 標準の仕組みで、追加依存は不要。

import { NativeModules } from "react-native";

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || "8001";

// Metro のバンドル URL を取り出す。取得経路は環境（Expo Go / 新アーキテクチャ /
// 素の RN）によって生えている場所が違うため、順に試す。
function metroUrl(): string | null {
  const fromNativeModules: unknown = NativeModules?.SourceCode?.scriptURL;
  if (typeof fromNativeModules === "string") return fromNativeModules;

  try {
    // RN 内部 API。Expo Go では SourceCode が生えていないことがあるため。
    const getDevServer = require("react-native/Libraries/Core/Devtools/getDevServer");
    const url = (getDevServer?.default ?? getDevServer)?.().url;
    if (typeof url === "string") return url;
  } catch {
    // 取れなくても致命的ではない（下でフォールバックする）
  }

  return null;
}

function baseUrlFromMetroHost(): string | null {
  const url = metroUrl();
  if (!url) return null;

  // 例: "http://10.200.1.199:8081/index.bundle?platform=ios&dev=true"
  const host = url.match(/^https?:\/\/([^/:]+)/)?.[1];

  // localhost しか取れなかった場合は「導出できなかった」とみなす。
  // 実機ではその値は端末自身を指してしまい、必ず通信できなくなるため。
  if (!host || host === "localhost" || host === "127.0.0.1") return null;

  return `http://${host}:${API_PORT}`;
}

// 1) 端末が実際に到達できた Metro のホストから導出（LAN IP が変わっても常に正しい）
// 2) 導出できなければ EXPO_PUBLIC_API_URL（compose がコンテナ生成時に埋める）
// 3) それも無ければ localhost（シミュレータ／同一マシン実行向け）
const BASE_URL =
  baseUrlFromMetroHost() ||
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8001";

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
