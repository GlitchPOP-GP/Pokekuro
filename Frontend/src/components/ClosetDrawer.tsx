import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDrawerPan } from '../hooks/useDrawerPan';
import { SelectedItems } from '../hooks/useClosetSelection';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap points for the bottom sheet
const COLLAPSED_Y = SCREEN_HEIGHT * (0.82 - 0.56); // 0.26 * SCREEN_HEIGHT (showing 56%)
const EXPANDED_Y = 0;                             // 0 * SCREEN_HEIGHT (showing 82%)

import { ClosetItem } from "../types/closet";
import type { ClosetCategory } from "../hooks/useCloset";

// ドロワーのアニメーションと、カテゴリ・タグ・アイテム選択のロジックを実装したコンポーネント。
export default function ClosetDrawer({
  isExpanded,
  setIsExpanded,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  setSelectedTags,
  selectedItems,
  toggleItemSelection,
  isItemSelected,
  filteredItems,
  tags,
}: {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  selectedCategory: ClosetCategory;
  setSelectedCategory: (category: ClosetCategory) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedItems: SelectedItems;
  toggleItemSelection: (item: ClosetItem) => void;
  isItemSelected: (item: ClosetItem) => boolean;
  filteredItems: ClosetItem[];
  tags: string[];
}) {
  const { translateY, panResponder } = useDrawerPan(isExpanded, setIsExpanded);

  const categories = ['shirt', 'pants', 'cap', 'heart'] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    shirt: "トップス",
    pants: "ボトムス",
    cap: "帽子",
    heart: "お気に入り",
  };


  // Helper to render category icons
  const renderCategoryIcon = (id: typeof categories[number], isSelected: boolean, size: number) => {
    const color = isSelected ? '#555555' : '#8e8e93';
    switch (id) {
      case 'shirt':
        return (
          <Image
            source={require('../../assets/famicons_shirt.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'pants':
        return (
          <Image
            source={require('../../assets/icon-park_clothes-pants.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'cap':
        return (
          <Image
            source={require('../../assets/boxicons_cap.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'heart':
        return <MaterialCommunityIcons name="heart-outline" size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.drawerContainer,
        {
          transform: [{ translateY: translateY }],
        },
      ]}
    >
      <ImageBackground
        source={require('../../assets/back.jpg')}
        style={styles.drawerBackground}
        imageStyle={styles.drawerContainerImage}
      >
        {/* Thumb-friendly touch target for dragger handle */}
        <View style={styles.draggerHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.draggerHandle} />
        </View>

        {/* categoryに応じてフィルタリング */}
        {/* Category Selector Tabs */}
        <View style={styles.categoriesRow}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, isSelected && styles.activeCategoryTab]}
                onPress={() => setSelectedCategory(cat)}
                accessibilityRole="tab"
                accessibilityLabel={categoryLabels[cat]}
                accessibilityState={{ selected: isSelected }}
              >
                {renderCategoryIcon(cat, isSelected, 28)}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tag Filters (Horizontal scrolling) */}
        {/* タブに応じてフィルタリング */}
        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, isSelected && styles.activeTagPill]}
                  onPress={() => {
                    if (isSelected) {
                      const nextTags = selectedTags.filter((t) => t !== tag);
                      setSelectedTags(nextTags.length === 0 ? [''] : nextTags);
                    } else {
                      setSelectedTags([...selectedTags.filter((t) => t !== ''), tag]);
                    }
                  }}
                >
                  <Text style={[styles.tagText, isSelected && styles.activeTagText]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Clothing Items Grid (FlatList) */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = isItemSelected(item);
            
            return (
              <TouchableOpacity
                style={[styles.itemCard, isSelected && styles.selectedItemCard]}
                activeOpacity={0.8}
                onPress={() => toggleItemSelection(item)}
                accessibilityLabel={`${item.name || categoryLabels[item.itemType]}を${isSelected ? "外す" : "着用する"}`}
              >
                <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check" size={14} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="hanger" size={34} color="#9b8a7d" />
              <Text style={styles.emptyText}>
                {selectedTags.some(Boolean) ? "選択したタグのアイテムはありません" : `${categoryLabels[selectedCategory as keyof typeof categoryLabels] ?? "アイテム"}はまだありません`}
              </Text>
            </View>
          }
        />
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  drawerBackground: {
    flex: 1,
    backgroundColor: '#f3e5d8', // Fallback color
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#e5d5c5',
    paddingBottom: 90, // Margin to accommodate absolute footer
  },
  drawerContainerImage: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  draggerHandleContainer: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggerHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#b5a18c',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    paddingBottom: 10,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#555555',
  },
  tagsContainer: {
    paddingVertical: 10,
  },
  tagsScroll: {
    paddingHorizontal: 16,
  },
  tagPill: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTagPill: {
    backgroundColor: '#1a1a1a',
  },
  tagText: {
    fontSize: 13,
    color: '#4a4a4a',
    fontWeight: '500',
  },
  activeTagText: {
    color: '#ffffff',
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 10,
    color: '#75675d',
    fontSize: 13,
    textAlign: 'center',
  },
  itemCard: {
    flex: 1 / 3,
    aspectRatio: 0.85,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 4,
    padding: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    borderColor: 'transparent',
    borderWidth: 2,
  },
  selectedItemCard: {
    borderColor: '#007AFF', // Clean iOS blue selection border
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});
