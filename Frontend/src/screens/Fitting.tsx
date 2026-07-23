import React, { useState } from "react";
import { View } from "react-native";
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
    </View>
  );
}
