import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { textStyles } from "../styles/text";
import { recentItemsStyles } from "../styles/components/cameraRecentItems";
import { ClosetItem } from "../types/closet";
import { useRecentItems } from "../hooks/useRecentItems";
import type { TabParamList } from "../navigation/tabs";

export default function CameraRecentItems() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { recentItems } = useRecentItems();

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
        {recentItems.length === 0 ? (
          <View style={{ paddingVertical: 24, paddingHorizontal: 4 }}>
            <Text style={{ color: "#7b6d63", fontSize: 14 }}>追加したアイテムはまだありません</Text>
          </View>
        ) : recentItems.map((item) => (
          <View key={item.id} style={recentItemsStyles.column}>
            <TouchableOpacity
              style={recentItemsStyles.itemCard}
              activeOpacity={0.8}
              onPress={() => handleItemPress(item)}
              accessibilityLabel={`${item.name || "アイテム"}を試着する`}
            >
              <Image source={item.image} style={recentItemsStyles.itemImage} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
