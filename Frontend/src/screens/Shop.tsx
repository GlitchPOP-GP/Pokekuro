import React, { useMemo, useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  Keyboard,
  Pressable,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import GlobalStyles from "../components/Background";
import TextBox from "../components/TextBox";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppContext } from "../store/AppContent";
import { shopStyles } from "../styles/screens/shop";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShopScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { posts } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<TextInput>(null);
  const filteredPosts = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase("ja");
    if (!query) return posts;
    return posts.filter((post) =>
      [post.user, post.caption].some((value) => value.toLocaleLowerCase("ja").includes(query))
    );
  }, [posts, searchText]);

  const openSearch = () => {
    setIsSearching(true);
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setIsSearching(false);
  };

  return (
    <GlobalStyles>
      <View style={shopStyles.container}>
        <View style={[shopStyles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={openSearch}
          >
            <BlurView
              intensity={85}
              tint="light"
              style={shopStyles.searchBox}
              pointerEvents="none"
            >
              <Feather
                name="search"
                size={20}
                color="#666"
                style={shopStyles.searchIcon}
              />

              <TextBox
                value={searchText}
                onChangeText={setSearchText}
                placeholder="検索"
                style={shopStyles.searchInput}
                editable={false}
              />
            </BlurView>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            shopStyles.gridContent,
            { paddingTop: insets.top + 58 },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={shopStyles.gridItem}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("PostDetail", {
                  postId: item.id,
                })
              }
            >
              <Image
                source={item.image}
                style={shopStyles.gridItemImage}
                resizeMode="cover"
              />
              <View style={shopStyles.userBadge}>
                <View style={shopStyles.userAvatarDot} />
                <Text numberOfLines={1} style={shopStyles.userName}>{item.user || "ユーザー"}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={shopStyles.emptyContainer}>
              <Feather name="search" size={34} color="#8d7c70" />
              <Text style={shopStyles.emptyTitle}>
                {searchText ? "一致する投稿がありません" : "投稿がまだありません"}
              </Text>
              <Text style={shopStyles.emptyText}>
                {searchText ? "別のキーワードで検索してみてください" : "新しい投稿が追加されるとここに表示されます"}
              </Text>
            </View>
          }
        />

        <Modal
          visible={isSearching}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeSearch}
          onShow={() => {
            searchInputRef.current?.focus();
          }}
        >
          <View style={shopStyles.modalContainer}>
            <Pressable
              style={shopStyles.modalOverlay}
              onPress={closeSearch}
            />

            <View
              style={[
                shopStyles.modalSearchHeader,
                { paddingTop: insets.top },
              ]}
            >
              <BlurView
                intensity={85}
                tint="light"
                style={shopStyles.searchBox}
              >
                <Feather
                  name="search"
                  size={20}
                  color="#666"
                  style={shopStyles.searchIcon}
                />

                <TextInput
                  ref={searchInputRef}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="検索"
                  style={shopStyles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={closeSearch}
                  clearButtonMode="while-editing"
                  accessibilityLabel="投稿を検索"
                />
              </BlurView>
            </View>
          </View>
        </Modal>
      </View>
    </GlobalStyles>
  );
}
