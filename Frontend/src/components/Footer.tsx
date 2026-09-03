import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { footerStyles } from "../styles/components/footer";
import { BlurView } from 'expo-blur';
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TABS } from "../navigation/tabs";

type IconLibrary = "Feather" | "MaterialCommunityIcons" | "MaterialIcons";

const renderIcon = (
  library: IconLibrary,
  name: string,
  color: string,
  size: number,
) => {
  switch (library) {
    case "Feather":
      return <Feather name={name as any} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons name={name as any} size={size} color={color} />
      );
    case "MaterialIcons":
      return <MaterialIcons name={name as any} size={size} color={color} />;
  }
};

export default function Footer({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView intensity={60} tint="light" style={[footerStyles.container, { paddingBottom: Math.max(insets.bottom, 12) }]} >
      <View style={footerStyles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={footerStyles.button}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isFocused }}
            >
              <View
                style={[footerStyles.iconWrap, isFocused && footerStyles.activeIconWrap]}
              >
                {renderIcon(
                  tab.iconLibrary,
                  tab.iconName,
                  isFocused ? "#111" : "#666",
                  26,
                )}
              </View>
              <Text style={[footerStyles.label, isFocused && footerStyles.activeLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
}
