import React, { useState,useRef } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  Keyboard,
  Pressable,
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
                placeholder="検索"
                style={shopStyles.searchInput}
                editable={false}
              />
            </BlurView>
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            shopStyles.gridContent,
            { paddingTop: insets.top + 58 },
          ]}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={shopStyles.gridItem}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("PostDetail", {
                  postIndex: index,
                })
              }
            >
              <Image
                source={item.image}
                style={shopStyles.gridItemImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
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
                />
              </BlurView>
            </View>
          </View>
        </Modal>
      </View>
    </GlobalStyles>
  );
}