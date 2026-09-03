import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { textStyles } from "../styles/text";
import { recentItemsStyles } from "../styles/components/recentItems";
import { useAppContext } from "../store/AppContent";
import type { TabParamList } from "../navigation/tabs";

export default function RecentItems() {
  const { closetItems } = useAppContext();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const displayItems = closetItems.slice(0, 6);

  return (
    <View style={recentItemsStyles.container}>
      <View style={recentItemsStyles.titleWrapper}>
        <Text style={textStyles.h3Text({ marginBottom: 5 })}>
          最近追加したアイテム
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={recentItemsStyles.list}
      >
        {displayItems.length === 0 ? (
          <View style={{ paddingVertical: 18 }}>
            <Text style={{ color: "#796b62" }}>アイテムを追加するとここに表示されます</Text>
          </View>
        ) : displayItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={recentItemsStyles.itemCard}
            onPress={() => navigation.navigate("Fitting", { selectedItem: item.id })}
            activeOpacity={0.82}
            accessibilityLabel={`${item.name || "アイテム"}を試着する`}
          >
            <Image
              source={item.image}
              style={recentItemsStyles.itemImage}
              resizeMode="cover"
            />

            <View style={recentItemsStyles.info}>
              <Text numberOfLines={1} style={recentItemsStyles.itemName}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
