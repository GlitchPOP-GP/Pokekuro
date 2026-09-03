import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { mockTabBarStyles } from "../styles/components/mockTabBar";

export default function MockTabBar({ navigation }: { navigation: any }) {
  const tabs: ReadonlyArray<{
    name: string;
    icon: string;
    library: "Feather" | "MaterialCommunityIcons";
    isCenter?: boolean;
  }> = [
    { name: "Home", icon: "home", library: "Feather" },
    { name: "Fitting", icon: "hanger", library: "MaterialCommunityIcons" },
    { name: "Camera", icon: "camera-outline", library: "MaterialCommunityIcons", isCenter: true },
    { name: "Shop", icon: "shopping-bag", library: "Feather" },
    { name: "Profile", icon: "user", library: "Feather" },
  ];

  const handlePress = (tabName: string) => {
    navigation.navigate("MainTabs", { screen: tabName });
  };

  return (
    <BlurView intensity={80} tint="light" style={mockTabBarStyles.container}>
      <View style={mockTabBarStyles.row}>
        {tabs.map((tab, idx) => {
          const isCenter = tab.isCenter;
          return (
            <TouchableOpacity
              key={idx}
              style={mockTabBarStyles.button}
              onPress={() => handlePress(tab.name)}
              activeOpacity={0.7}
            >
              <View style={[mockTabBarStyles.iconWrap, isCenter && mockTabBarStyles.centerIconWrap]}>
                {tab.library === "Feather" ? (
                  <Feather name={tab.icon as any} size={26} color="#666" />
                ) : (
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={isCenter ? 30 : 26}
                    color="#111"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
}
