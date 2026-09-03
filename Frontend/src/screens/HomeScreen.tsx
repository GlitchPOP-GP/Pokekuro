import React from "react";
import { ScrollView, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 自作コンポーネント
import TodayPickCard from "../components/TodayPickCard";
import RecentItems from "../components/RecentItems";
import GlobalStyles from "../components/Background";
import AddItemCard from "../components/AddItemCard";

// navigation型
import type { TabParamList } from "../navigation/tabs";

// スタイル
import { homeStyles } from "../styles/screens/home";
type Props = BottomTabScreenProps<TabParamList, "Home">;

export default function Home({ navigation }: Props) {
  const insets = useSafeAreaInsets();

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[homeStyles.content, { paddingBottom: insets.bottom + 96 }]}
        >
          <TodayPickCard />
          <AddItemCard onPress={() => navigation.navigate("Camera")} />
          <RecentItems />
        </ScrollView>
      </View>
    </GlobalStyles>
  );
}
