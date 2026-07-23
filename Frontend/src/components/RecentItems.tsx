import React from "react";
import { View, Text, ScrollView, Image } from "react-native";

import { textStyles } from "../styles/text";
import { recentItemsStyles } from "../styles/components/recentItems";
import { useAppContext } from "../store/AppContent";

export default function RecentItems() {
  const { closetItems } = useAppContext();
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
        {displayItems.map((item) => (
          <View key={item.id} style={recentItemsStyles.itemCard}>
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
