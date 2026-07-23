import { ClothingItem, ClothingCategory } from "../types";

export const SEASONS = ["春服", "夏服", "秋服", "冬服"];

// 上下カテゴリの選択肢（表示ラベル → 内部カテゴリ）
export const CATEGORY_OPTIONS = ["トップス", "ボトムス"];
export const CATEGORY_LABEL_TO_VALUE: Record<string, "shirt" | "pants"> = {
  トップス: "shirt",
  ボトムス: "pants",
};

/**
 * 季節を選択した際に、既存の季節タグを除去して新しい季節タグを追加します。
 */
export function updateSeasonTags(currentTags: string[], newSeason: string): string[] {
  const seasonTag = `#${newSeason}`;
  
  // 既存の季節タグ（#春服、#夏服など）を除去
  const filtered = currentTags.filter(
    (tag) => !SEASONS.some((season) => `#${season}` === tag)
  );
  
  // 新しい季節タグを追加
  return [...filtered, seasonTag];
}

/**
 * クローゼットに新規登録するアイテムのデータ構造（エンティティ）を作成します。
 */
export function createClosetItemEntity(
  previewImage: any,
  tags: string[],
  shopName: string | undefined,
  category: ClothingCategory
): Omit<ClothingItem, "id"> {
  return {
    name: "新しいアイテム",
    image: previewImage,
    category,
    tags: tags,
    memo: shopName ? `購入店舗: ${shopName}` : undefined,
  };
}
