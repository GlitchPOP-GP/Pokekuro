import { ClosetItem } from "../types/closet";
import { api, resolveMediaUrl } from "./client";

// バックエンドの clothing_items 1行の形
interface ApiClothingItem {
  id: string | number;
  user_id: string;
  image: string;
  category: string | null;
  season: string | null;
  location_id: number | null;
  name?: string | null;
  tags?: string[];
  glb_url?: string | null;
}

// 仕様書のカテゴリ（日本語）と、フロントのタブキー（英語）の対応
const JP_TO_KEY: Record<string, ClosetItem["itemType"]> = {
  トップス: "shirt",
  ボトムス: "pants",
  帽子: "cap",
  その他: "shirt",
};

const KEY_TO_JP: Record<ClosetItem["itemType"], string> = {
  shirt: "トップス",
  pants: "ボトムス",
  cap: "帽子",
};

function toClosetItem(
  row: ApiClothingItem,
  categoryOverride?: ClosetItem["category"]
): ClosetItem {
  const key = JP_TO_KEY[row.category ?? ""] ?? "shirt";
  return {
    id: String(row.id),
    name: row.name ?? "",
    image: { uri: resolveMediaUrl(row.image) },
    category: categoryOverride ?? key,
    tags: row.tags ?? [],
    itemType: key,
    glbUrl: row.glb_url ? resolveMediaUrl(row.glb_url) : null,
  };
}

/**
 * ログインユーザーのクローゼット一覧を取得する。
 * 通常アイテム（トップス/ボトムス/帽子タブ）に加え、
 * お気に入りを heart タブ用エントリとして複製して返す。
 * 未ログイン等で失敗した場合は空配列を返す（UI を壊さない）。
 */
export const fetchClosetItems = async (): Promise<ClosetItem[]> => {
  try {
    const [items, favorites] = await Promise.all([
      api<ApiClothingItem[]>("/api/clothing-items/mine", { auth: true }),
      api<ApiClothingItem[]>("/api/clothing-items/favorites", { auth: true }),
    ]);
    const mapped = items.map((row) => toClosetItem(row));
    const favMapped = favorites.map((row) => ({
      ...toClosetItem(row, "heart"),
      originalItemId: String(row.id),
    }));
    return [...mapped, ...favMapped];
  } catch {
    return [];
  }
};

export const fetchRecentClosetItems = async (): Promise<ClosetItem[]> => {
  try {
    const items = await api<ApiClothingItem[]>("/api/clothing-items/mine", { auth: true });
    return items.map((row) => toClosetItem(row)).slice(0, 6);
  } catch {
    return [];
  }
};

// タグ名の配列を tags テーブルに upsert して id 配列に変換する
async function ensureTagIds(tagNames: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const tag_name of tagNames) {
    const row = await api<{ id: number | string }>("/api/tags", {
      method: "POST",
      auth: true,
      body: { tag_name },
    });
    ids.push(Number(row.id));
  }
  return ids;
}

/**
 * クローゼットに新規アイテムを登録する。
 * image は URL 文字列（ストレージキー）。tags はタグ名の配列で、
 * 内部で tags テーブルに解決してから紐付ける。
 */
export async function createClosetItem(input: {
  image: string;
  name?: string;
  itemType?: ClosetItem["itemType"];
  season?: string;
  tags?: string[];
  locationId?: string | number;
}): Promise<ClosetItem> {
  const tagIds = input.tags?.length ? await ensureTagIds(input.tags) : [];
  const row = await api<ApiClothingItem>("/api/clothing-items", {
    method: "POST",
    auth: true,
    body: {
      image: input.image,
      name: input.name,
      category: KEY_TO_JP[input.itemType ?? "shirt"],
      season: input.season,
      location_id: input.locationId,
      tag_ids: tagIds,
    },
  });
  return toClosetItem(row);
}

// サーバー側は所有者チェック付き（他人のアイテムは 404）。
// clothing_item_tags / item_favorites / fitting_jobs は
// ON DELETE CASCADE で一緒に消える。
export async function deleteClosetItem(id: string): Promise<void> {
  await api(`/api/clothing-items/${id}`, { method: "DELETE", auth: true });
}

export async function favoriteItem(id: string): Promise<void> {
  await api(`/api/clothing-items/${id}/favorite`, { method: "POST", auth: true });
}

export async function unfavoriteItem(id: string): Promise<void> {
  await api(`/api/clothing-items/${id}/favorite`, { method: "DELETE", auth: true });
}
