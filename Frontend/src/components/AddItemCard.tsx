import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { addItemCardStyles } from "../styles/addItemCard";

type Props = {
  onPress: () => void;
};

export default function AddItemCard({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={addItemCardStyles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={addItemCardStyles.leftSection}>
        <View style={addItemCardStyles.plusButton}>
          <Text style={addItemCardStyles.plusText}>+</Text>
        </View>

        <View style={addItemCardStyles.textContainer}>
          <Text style={addItemCardStyles.title}>アイテムを追加</Text>

          <Text style={addItemCardStyles.subtitle}>
            クローゼットをもっと充実させよう
          </Text>
        </View>
      </View>

      <View style={addItemCardStyles.previewContainer}>
        <Image
          source={require("../../assets/blue_denim_jeans.png")}
          style={addItemCardStyles.previewImage}
        />

        <Image
          source={require("../../assets/brown_baseball_cap.png")}
          style={addItemCardStyles.previewImage}
        />

        <Image
          source={require("../../assets/brown_cargo_pants.png")}
          style={addItemCardStyles.previewImage}
        />
      </View>
    </TouchableOpacity>
  );
}
