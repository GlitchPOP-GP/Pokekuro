import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ClosetItem } from "../types/closet";
import { fetchClosetItems } from "../api/closet";

export type ClosetCategory = "shirt" | "pants" | "cap" | "bookmark" | "heart";

export function useCloset() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClosetCategory>("shirt");
  const [selectedTags, setSelectedTags] = useState<string[]>([""]);

  // 画面にフォーカスが戻るたびに再取得する。
  // （タブは一度マウントされると生き続けるので、他の画面でアイテムを追加した後
  //   このタブに戻ってきた時に glb_url 等の最新状態を反映させるために必要）
  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchClosetItems().then((data) => {
        if (active) {
          setItems(data);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const tags = useMemo(() => {
    const uniqueTags: string[] = [];
    items.forEach((item) => {
      if (item && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          if (tag && !uniqueTags.includes(tag)) {
            uniqueTags.push(tag);
          }
        });
      }
    });
    return uniqueTags;
  }, [items]);

  const activeTags = selectedTags.filter((tag) => tag !== "");

  const filteredItems = items.filter((item) => {
    const matchesCategory = item.category === selectedCategory;
    const matchesTags =
      activeTags.length === 0 ||
      item.tags.some((tag) => activeTags.includes(tag));
    return matchesCategory && matchesTags;
  });

  return {
    items,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    tags,
    filteredItems,
  };
}
