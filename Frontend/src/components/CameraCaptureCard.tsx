import React from "react";
import { View } from "react-native";
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
      </View>
    </View>
  );
}
