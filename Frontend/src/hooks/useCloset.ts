import { useMemo, useState } from "react";
import { useAppContext } from "../store/AppContent";

export type ClosetCategory = "shirt" | "pants" | "cap" | "bookmark" | "heart";

export function useCloset() {
  const { closetItems: items } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<ClosetCategory>("shirt");
  const [selectedTags, setSelectedTags] = useState<string[]>([""]);

  const visibleItems = useMemo(
    () => items.filter((item) => item.fittingStatus !== "failed"),
    [items]
  );

  const tags = useMemo(() => {
    const uniqueTags: string[] = [];
    visibleItems.forEach((item) => {
      if (item && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          if (tag && !uniqueTags.includes(tag)) {
            uniqueTags.push(tag);
          }
        });
      }
    });
    return uniqueTags;
  }, [visibleItems]);

  const activeTags = selectedTags.filter((tag) => tag !== "");

  const filteredItems = visibleItems.filter((item) => {
    const matchesCategory = selectedCategory === "bookmark"
      ? item.originalItemId?.startsWith("post:")
      : item.category === selectedCategory;
    const matchesTags =
      activeTags.length === 0 ||
      item.tags.some((tag) => activeTags.includes(tag));
    return matchesCategory && matchesTags;
  });

  return {
    items: visibleItems,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    tags,
    filteredItems,
    isLoading: false,
  };
}
