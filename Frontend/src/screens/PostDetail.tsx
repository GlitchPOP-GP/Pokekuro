import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppContext } from "../store/AppContent";
import { likePost, unlikePost } from "../api/posts";
import { postDetailStyles } from "../styles/screens/postDetail";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetail({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { posts } = useAppContext();
  const { postIndex } = route.params;
  const post = posts[postIndex % posts.length];

  // いいねはローカルで楽観的にトグルしつつ、実際の状態は post_likes に永続化する
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleToggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    try {
      if (next) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }
    } catch (err) {
      // 失敗したら表示を元に戻す
      setLiked(!next);
      setLikesCount((c) => c + (next ? -1 : 1));
    }
  };

  return (
    <View style={postDetailStyles.container}>
      <ImageBackground source={post.image} resizeMode="cover" style={postDetailStyles.fullImage}>
        <View style={postDetailStyles.innerContainer}>
          {/* Top bar */}
          <View style={[postDetailStyles.topBar, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              style={postDetailStyles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={postDetailStyles.iconButton}>
              <Feather name="more-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Navigation arrows */}
          <View style={postDetailStyles.arrowRow}>
            <TouchableOpacity style={postDetailStyles.arrowButton}>
              <Feather name="chevron-left" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={postDetailStyles.arrowButton}>
              <Feather name="chevron-right" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom bar */}
          <View style={[postDetailStyles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
            <View style={postDetailStyles.userRow}>
              <View style={postDetailStyles.avatar}>
                <Image
                  source={post.image}
                  style={postDetailStyles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={postDetailStyles.username}>{post.user}</Text>
              <TouchableOpacity style={postDetailStyles.followButton}>
                <Text style={postDetailStyles.followText}>フォロー</Text>
              </TouchableOpacity>
            </View>

            <Text style={postDetailStyles.caption}>{post.caption}</Text>

            <View style={postDetailStyles.actionsRow}>
              <TouchableOpacity style={postDetailStyles.actionButton} onPress={handleToggleLike}>
                <Feather name="heart" size={20} color={liked ? "#ff3b30" : "#fff"} />
                <Text style={postDetailStyles.actionText}>{likesCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={postDetailStyles.actionButton}>
                <Feather name="message-circle" size={20} color="#fff" />
                <Text style={postDetailStyles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={postDetailStyles.actionButton}>
                <Feather name="share-2" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
