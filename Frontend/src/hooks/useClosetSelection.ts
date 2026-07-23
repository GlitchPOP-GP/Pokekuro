import { useState, useEffect } from 'react';
import { ClosetItem } from '../types/closet';

export interface SelectedItems {
  shirt?: string;
  pants?: string;
  cap?: string;
}

export function useClosetSelection(
  items: ClosetItem[],
  initialItemId?: string,
  onItemAutoSelect?: (category: ClosetItem['category']) => void
) {
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});

  // Helper to get the actual/original item ID if the item is an alias (e.g. bookmarks)
  const getEffectiveId = (item: ClosetItem) => item.originalItemId || item.id;

  // Handle item pre-selection passed from navigation parameters
  useEffect(() => {
    if (initialItemId) {
      const matchedItem = items.find((item) => item.id === initialItemId);
      if (matchedItem) {
        const itemType = matchedItem.itemType;
        const effectiveId = getEffectiveId(matchedItem);
        setSelectedItems((prev) => ({
          ...prev,
          [itemType]: effectiveId,
        }));

        if (onItemAutoSelect) {
          onItemAutoSelect(matchedItem.category);
        }
      }
    }
  }, [initialItemId]);

  const toggleItemSelection = (item: ClosetItem) => {
    const { itemType } = item;
    const effectiveId = getEffectiveId(item);

    setSelectedItems((prev) => {
      const currentSelected = prev[itemType];
      if (currentSelected === effectiveId) {
        // Unselect if already selected
        const next = { ...prev };
        delete next[itemType];
        return next;
      } else {
        // Select new item for this category
        return {
          ...prev,
          [itemType]: effectiveId,
        };
      }
    });
  };

  const isItemSelected = (item: ClosetItem) => {
    const selectedId = selectedItems[item.itemType];
    return selectedId === item.id || !!(item.originalItemId && selectedId === item.originalItemId);
  };

  return {
    selectedItems,
    toggleItemSelection,
    isItemSelected,
    setSelectedItems,
  };
}
