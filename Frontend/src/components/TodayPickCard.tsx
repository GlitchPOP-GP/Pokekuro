import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/RootNavigator";

import TodayPickItem from "./TodayPickItem";
import { fetchTodayPicks, TodayPick } from "../api/todayPick";
import { todayPickStyles } from "../styles/components/todayPick";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const CARD_WIDTH = SCREEN_WIDTH - 10;
export const CARD_HEIGHT = 240;
const AUTO_SCROLL_TIME = 5000;
export default function TodayPickCard() {
  const navigation = useNavigation<NavigationProp>();

  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayPickData, setTodayPickData] = useState<TodayPick[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleNavigate = () => {
    navigation.navigate("Fitting");
  };

  // API から TODAY'S PICK を取得
  useEffect(() => {
    fetchTodayPicks().then(setTodayPickData);
  }, []);

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (todayPickData.length === 0) return prev;
        const next = prev === todayPickData.length - 1 ? 0 : prev + 1;

        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });

        return next;
      });
    }, AUTO_SCROLL_TIME);
  }, [todayPickData.length]);

  useEffect(() => {
    startAutoScroll();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startAutoScroll]);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    // 割る値は項目幅と一致していないといけない。
    // 項目は SCREEN_WIDTH 幅で並んでいる（CARD_WIDTH は枠の見た目用）。
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);

    setCurrentIndex(index);
    startAutoScroll();
  };

  return (
    <View style={todayPickStyles.wrapper}>
      <View style={todayPickStyles.cardFrame}>
        <View style={todayPickStyles.container}>
          {/* 動画 */}
          <FlatList
            ref={flatListRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="center"
            decelerationRate="fast"
            data={todayPickData}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={onMomentumScrollEnd}
            // 項目幅は SCREEN_WIDTH 固定なので正確に返せる。
            // これが無いと Web 版で自動スクロールの scrollToIndex が
            // 「画面外の位置が計算できない」と例外を投げ、アプリ全体が落ちる。
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            style={{
              flex: 1,
            }}
            contentContainerStyle={{
              justifyContent: "center",
            }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: SCREEN_WIDTH,
                  alignItems: "center",
                }}
              >
                <TodayPickItem
                  item={item}
                  isActive={currentIndex === index}
                  onPress={handleNavigate}
                />
              </View>
            )}
          />

          {/* ===== 動画の上に固定 ===== */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={todayPickStyles.header}
            onPress={handleNavigate}
          >
            <Text style={todayPickStyles.title}>TODAY'S PICK</Text>

            <Text style={todayPickStyles.arrow}>›</Text>
          </TouchableOpacity>

          {/* ===== インジケーター ===== */}
          <View style={todayPickStyles.indicatorContainer}>
            {todayPickData.map((_, index) => (
              <View
                key={index}
                style={[
                  todayPickStyles.dot,
                  currentIndex === index && todayPickStyles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
