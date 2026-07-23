import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { textStyles } from "../styles/text";
import { recentItemsStyles } from "../styles/components/cameraRecentItems";
import { ClosetItem } from "../types/closet";
import { useRecentItems } from "../hooks/useRecentItems";

export default function CameraRecentItems() {
  const navigation = useNavigation<any>();
  const { recentItems } = useRecentItems();

  // Map the items into columns with duplicated top/bottom rows for scrolling layout
  const columns = recentItems.map((item) => ({
    top: item,
    bottom: item,
  }));

  const handleItemPress = (item: ClosetItem) => {
    // Navigate to Fitting screen and pass the selectedItem ID parameter
    // アイテムをタップしたときにFitting画面に遷移し、selectedItemのIDを渡す
    navigation.navigate("Fitting", { selectedItem: item.id });
  };

  return (
    <View style={recentItemsStyles.container}>
      <View style={recentItemsStyles.titleWrapper}>
        <Text
          style={textStyles.h2Text({
            fontSize: 22,
            marginBottom: 0,
            color: "#111111",
          })}
        >
          最近追加したアイテム
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={recentItemsStyles.list}
      >
        {columns.map((col, index) => (
          <View key={index} style={recentItemsStyles.column}>
            {/* Top Row Item */}
            <TouchableOpacity
              style={recentItemsStyles.itemCard}
              activeOpacity={0.8}
              onPress={() => handleItemPress(col.top)}
            >
              <Image source={col.top.image} style={recentItemsStyles.itemImage} />
            </TouchableOpacity>

            {/* Bottom Row Item */}
            <TouchableOpacity
              style={recentItemsStyles.itemCard}
              activeOpacity={0.8}
              onPress={() => handleItemPress(col.bottom)}
            >
              <Image source={col.bottom.image} style={recentItemsStyles.itemImage} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
