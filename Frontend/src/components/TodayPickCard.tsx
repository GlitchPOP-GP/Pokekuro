import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "../navigation/tabs";

import TodayPickItem from "./TodayPickItem";
import { fetchTodayPicks, TodayPick } from "../api/todayPick";
import { todayPickStyles } from "../styles/components/todayPick";

export const CARD_HEIGHT = 240;
const AUTO_SCROLL_TIME = 5000;
export default function TodayPickCard() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width - 30, 280), 680);

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
    const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);

    setCurrentIndex(index);
    startAutoScroll();
  };

  return (
    <View style={todayPickStyles.wrapper}>
      <View style={[todayPickStyles.cardFrame, { width: cardWidth }]}>
        <View style={todayPickStyles.container}>
          {/* 動画 */}
          <FlatList
            ref={flatListRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth}
            snapToAlignment="center"
            decelerationRate="fast"
            data={todayPickData}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={onMomentumScrollEnd}
            style={{
              flex: 1,
              width: cardWidth,
            }}
            contentContainerStyle={{
              justifyContent: "center",
            }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: cardWidth,
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

          {todayPickData.length === 0 && (
            <View style={todayPickStyles.emptyState}>
              <Text style={todayPickStyles.emptyText}>おすすめコーデを準備しています</Text>
            </View>
          )}

          {/* ===== 動画の上に固定 ===== */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={todayPickStyles.header}
            onPress={handleNavigate}
          >
            <Text style={todayPickStyles.title}>TODAY'S PICK</Text>

            {todayPickData.length > 0 && <Text style={todayPickStyles.arrow}>›</Text>}
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
