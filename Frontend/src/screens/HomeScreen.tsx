import React from "react";

// React Native コンポーネント
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 自作コンポーネント
import TodayPickCard from "../components/TodayPickCard";
import RecentItems from "../components/RecentItems";
import GlobalStyles from "../components/Background";
import AddItemCard from "../components/AddItemCard";

// navigation型
import type { RootStackParamList } from "../navigation/RootNavigator";

// スタイル
import { homeStyles } from "../styles/screens/home";
import { textStyles } from "../styles/text";

type Props = NativeStackScreenProps<RootStackParamList, "MainTabs">;

export default function Home({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleAddItem = () => {
    console.log("アイテム追加処理を記載");
  };

  return (
    <GlobalStyles>
      <View
        style={[
          homeStyles.screen,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={homeStyles.content}>
          <TodayPickCard />
          <AddItemCard onPress={handleAddItem} />
          <RecentItems />
        </View>
      </View>
    </GlobalStyles>
  );
}
