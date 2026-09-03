import React from "react";

import {
  TouchableOpacity,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";


import { buttonStyles } from "../styles/button";

type Props = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  icon,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.8}
      style={[buttonStyles.button, disabled && buttonStyles.disabled, style]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {icon}

        <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
