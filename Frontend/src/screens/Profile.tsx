import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GlobalStyles from "../components/Background";
import ProfileHeader from "../components/ProfileHeader";
import { useProfile } from "../hooks/useProfile";
import { profileStyles } from "../styles/screens/profile";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const {
    user,
    userPosts,
    displayedPosts,
    selectedTab,
    setSelectedTab,
    emptyMessage,
  } = useProfile();

  const handleSettingsPress = () => {
    console.log("設定画面へ遷移");
  };

  return (
    <GlobalStyles>
      <View style={[profileStyles.overlay, { paddingTop: insets.top }]}>
        <FlatList
          data={displayedPosts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={profileStyles.postsGrid}
          ListHeaderComponent={
            <ProfileHeader
              user={user}
              postsCount={userPosts.length}
              selectedTab={selectedTab}
              onChangeTab={setSelectedTab}
              onPressSettings={handleSettingsPress}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={profileStyles.gridItem}
              activeOpacity={0.85}
            >
              <Image
                source={item.image}
                style={profileStyles.gridItemImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={profileStyles.emptyContainer}>
              <Text style={profileStyles.emptyText}>
                {emptyMessage}
              </Text>
            </View>
          }
        />
      </View>
    </GlobalStyles>
  );
}