import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { profileStyles } from "../styles/screens/profile";
import type { ProfileTab } from "../hooks/useProfile";

type ProfileTabsProps = {
  selectedTab: ProfileTab;
  onChangeTab: (tab: ProfileTab) => void;
};

export default function ProfileTabs({
  selectedTab,
  onChangeTab,
}: ProfileTabsProps) {
  return (
    <View style={profileStyles.tabRow}>
      <TouchableOpacity
        style={profileStyles.tabButton}
        activeOpacity={0.7}
        onPress={() => onChangeTab("posts")}
      >
        <MaterialIcons
          name="grid-view"
          size={32}
          color={selectedTab === "posts" ? "#111" : "#aaa"}
        />

        {selectedTab === "posts" && (
          <View style={profileStyles.tabIndicator} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={profileStyles.tabButton}
        activeOpacity={0.7}
        onPress={() => onChangeTab("favorites")}
      >
        <MaterialIcons
          name="favorite-border"
          size={36}
          color={selectedTab === "favorites" ? "#111" : "#aaa"}
        />

        {selectedTab === "favorites" && (
          <View style={profileStyles.tabIndicator} />
        )}
      </TouchableOpacity>
    </View>
  );
}