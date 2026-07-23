import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { profileStyles } from "../styles/screens/profile";
import ProfileTabs from "./ProfileTabs";
import type { ProfileTab } from "../hooks/useProfile";

type ProfileHeaderProps = {
  user: {
    name: string;
    avatar: ImageSourcePropType;
  };
  postsCount: number;
  selectedTab: ProfileTab;
  onChangeTab: (tab: ProfileTab) => void;
  onPressSettings: () => void;
};

export default function ProfileHeader({
  user,
  postsCount,
  selectedTab,
  onChangeTab,
  onPressSettings,
}: ProfileHeaderProps) {
  return (
    <View style={profileStyles.userSection}>
      <TouchableOpacity
        style={profileStyles.settingsButton}
        activeOpacity={0.7}
        onPress={onPressSettings}
      >
        <MaterialIcons
          name="settings"
          size={32}
          color="#fff"
        />
      </TouchableOpacity>

      <View style={profileStyles.topRow}>
        <View style={profileStyles.avatar}>
          <Image
            source={user.avatar}
            style={profileStyles.avatarImage}
            resizeMode="cover"
          />
        </View>

        <View style={profileStyles.statsRow}>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.username}>
              {user.name}
            </Text>

            <Text style={profileStyles.statLabel}>
              投稿
            </Text>

            <Text style={profileStyles.statNumber}>
              {postsCount}
            </Text>
          </View>
        </View>
      </View>

      <ProfileTabs
        selectedTab={selectedTab}
        onChangeTab={onChangeTab}
      />
    </View>
  );
}