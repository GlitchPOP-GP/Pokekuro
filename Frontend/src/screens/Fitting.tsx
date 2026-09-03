import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import ClosetDrawer from "../components/ClosetDrawer";
import ModelViewer from "../components/ModelViewer";
import { useClosetSelection } from "../hooks/useClosetSelection";
import { useCloset } from "../hooks/useCloset";

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
    isLoading,
  } = useCloset();

  const {
    selectedItems,
    toggleItemSelection,
    isItemSelected,
  } = useClosetSelection(items, route.params?.selectedItem, (category) => {
    setSelectedCategory(category);
  });


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
        filteredItems={filteredItems}
      />
      {isLoading && (
        <View pointerEvents="none" style={{ position: "absolute", top: 16, alignSelf: "center", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.88)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 }}>
          <ActivityIndicator size="small" color="#4b2e1e" />
          <Text style={{ marginLeft: 8, color: "#4b3b32", fontSize: 12 }}>クローゼットを読み込み中</Text>
        </View>
      )}
    </View>
  );
}
