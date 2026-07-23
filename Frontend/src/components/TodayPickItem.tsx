import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";

import { todayPickStyles } from "../styles/components/todayPick";

type TodayPickItemType = {
  id: string;
  thumbnail: string;
  video: string;
  user: string;
  title: string;
};

type Props = {
  item: TodayPickItemType;
  isActive: boolean;
  onPress: () => void;
};

export default function TodayPickItem({ item, isActive, onPress }: Props) {
  const [showThumbnail, setShowThumbnail] = useState(true);

  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isActive) {
      setShowThumbnail(true);

      player.currentTime = 0;
      player.play();

      timer = setTimeout(() => {
        setShowThumbnail(false);
      }, 700);
    } else {
      player.pause();
      player.currentTime = 0;
      setShowThumbnail(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive]);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={todayPickStyles.card}
      onPress={onPress}
    >
      <VideoView
        player={player}
        style={todayPickStyles.video}
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
      />

      {showThumbnail && (
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(250)}
          style={todayPickStyles.thumbnailContainer}
        >
          <Image
            source={{ uri: item.thumbnail }}
            style={todayPickStyles.thumbnail}
          />

          <View style={todayPickStyles.playButton}>
            <Text style={todayPickStyles.playIcon}>▶</Text>
          </View>
        </Animated.View>
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
        style={todayPickStyles.overlay}
      />

      {/* -------- 下部 -------- */}

      <View style={todayPickStyles.infoContainer}>
        <Text numberOfLines={1} style={todayPickStyles.user}>
          @{item.user}
        </Text>

        <Text numberOfLines={2} style={todayPickStyles.videoTitle}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
