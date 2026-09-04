import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { captureCardStyles } from "../styles/components/cameraCaptureCard";

export default function CameraCaptureCard() {
  return (
    <View style={captureCardStyles.container}>
      {/* Corner guides */}
      <View style={[captureCardStyles.corner, captureCardStyles.topLeft]} />
      <View style={[captureCardStyles.corner, captureCardStyles.topRight]} />
      <View style={[captureCardStyles.corner, captureCardStyles.bottomLeft]} />
      <View style={[captureCardStyles.corner, captureCardStyles.bottomRight]} />

      {/* Center hanger box */}
      <View style={captureCardStyles.centerArea}>
        <View style={captureCardStyles.hangerBox}>
          <MaterialCommunityIcons name="hanger" size={44} color="#b8b8b8" />
        </View>
        <Text style={captureCardStyles.title}>アイテムを撮影</Text>
        <Text style={captureCardStyles.description}>
          服全体が枠内に収まるように撮影してください
        </Text>
        <View style={captureCardStyles.captureButton}>
          <MaterialCommunityIcons name="camera-outline" size={20} color="#fff" />
          <Text style={captureCardStyles.captureButtonText}>カメラを開く</Text>
        </View>
      </View>
    </View>
  );
}
