import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GlobalStyles from "../components/Background";
import ProfileHeader from "../components/ProfileHeader";
import { useProfile } from "../hooks/useProfile";
import { profileStyles } from "../styles/screens/profile";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../store/AuthContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const {
    user,
    userPosts,
    displayedPosts,
    selectedTab,
    setSelectedTab,
    emptyMessage,
  } = useProfile();

  const handleSettingsPress = () => {
    Alert.alert("アカウント", "アカウント操作を選択してください", [
      { text: "キャンセル", style: "cancel" },
      { text: "ログアウト", style: "destructive", onPress: logout },
    ]);
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
              onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
              accessibilityLabel={`${item.user || "ユーザー"}の投稿を開く`}
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
