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
};

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  icon,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[buttonStyles.button, style]}>
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
