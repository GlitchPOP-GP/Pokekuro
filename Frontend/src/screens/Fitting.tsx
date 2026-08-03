import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";

import ClosetDrawer from "../components/ClosetDrawer";
import ModelViewer from "../components/ModelViewer";
import { useClosetSelection } from "../hooks/useClosetSelection";
import { useCloset } from "../hooks/useCloset";
import { deleteClosetItem } from "../api/closet";
import { ClosetItem } from "../types/closet";

import { fittingStyles } from "../styles/screens/fitting";

export default function FittingScreen() {
  const route = useRoute<any>();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    items,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    tags,
    filteredItems,
    refetch,
  } = useCloset();

  const {
    selectedItems,
    toggleItemSelection,
    isItemSelected,
    setSelectedItems,
  } = useClosetSelection(items, route.params?.selectedItem, (category) => {
    setSelectedCategory(category);
  });

  // 長押しで削除。お気に入りタブの項目は複製（エイリアス）なので、
  // 実体の id（originalItemId）を対象にする。
  const handleLongPressItem = (item: ClosetItem) => {
    const targetId = item.originalItemId || item.id;

    Alert.alert(
      "この服を削除しますか？",
      `${item.name || "この服"}をクローゼットから削除します。元に戻せません。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClosetItem(targetId);

              // 着用中のまま消すとアバターに服だけ残るので選択を外す
              setSelectedItems((prev) => {
                const next = { ...prev };
                (Object.keys(next) as (keyof typeof next)[]).forEach((key) => {
                  if (next[key] === targetId) delete next[key];
                });
                return next;
              });

              await refetch();
            } catch (err: any) {
              Alert.alert("削除に失敗しました", err?.message ?? String(err));
            }
          },
        },
      ]
    );
  };


  return (
    <View style={fittingStyles.container}>
      <View style={fittingStyles.avatarSection}>
        <View style={fittingStyles.gridContainer} pointerEvents="none">
          {[...Array(6)].map((_, i) => (
            <View
              key={`v-${i}`}
              style={[fittingStyles.gridLineVert, { left: `${(i + 1) * 16.6}%` }]}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <View
              key={`h-${i}`}
              style={[fittingStyles.gridLineHoriz, { top: `${(i + 1) * 16.6}%` }]}
            />
          ))}
        </View>

        <View style={fittingStyles.modelContainer}>
          <ModelViewer
            selectedItems={selectedItems}
            items={items}
            onTap={() => {
              if (isExpanded) setIsExpanded(false);
            }}
          />
        </View>
      </View>

      <ClosetDrawer
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        tags={tags}
        selectedItems={selectedItems}
        toggleItemSelection={toggleItemSelection}
        isItemSelected={isItemSelected}
        onLongPressItem={handleLongPressItem}
        filteredItems={filteredItems}
      />
    </View>
  );
}
