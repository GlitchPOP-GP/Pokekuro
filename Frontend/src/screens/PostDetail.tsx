import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppContext } from "../store/AppContent";
import { fetchLikedPosts, likePost, unlikePost } from "../api/posts";
import { postDetailStyles } from "../styles/screens/postDetail";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetail({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { posts } = useAppContext();
  const post = posts.find((entry) => entry.id === route.params.postId);

  // いいねはローカルで楽観的にトグルしつつ、実際の状態は post_likes に永続化する
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLikesCount(post.likes);
    fetchLikedPosts().then((likedPosts) => setLiked(likedPosts.some((entry) => entry.id === post.id)));
  }, [post?.id]);

  if (!post) {
    return (
      <View style={[postDetailStyles.container, postDetailStyles.missingContainer]}>
        <Text style={postDetailStyles.missingTitle}>投稿を表示できません</Text>
        <Text style={postDetailStyles.missingText}>投稿が削除されたか、読み込みに失敗した可能性があります。</Text>
        <TouchableOpacity style={postDetailStyles.backButton} onPress={() => navigation.goBack()}>
          <Text style={postDetailStyles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const movePost = (offset: number) => {
    const currentIndex = posts.findIndex((entry) => entry.id === post.id);
    if (currentIndex < 0 || posts.length < 2) return;
    const nextIndex = (currentIndex + offset + posts.length) % posts.length;
    navigation.setParams({ postId: posts[nextIndex].id });
  };

  const handleShare = async () => {
    await Share.share({ message: `${post.user}さんの投稿\n${post.caption}`.trim() });
  };

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
            <TouchableOpacity
              style={postDetailStyles.iconButton}
              onPress={() => Alert.alert("投稿メニュー", "この投稿に対する操作を選択してください", [
                { text: "キャンセル", style: "cancel" },
                { text: "問題を報告", onPress: () => Alert.alert("報告を受け付けました") },
              ])}
              accessibilityLabel="投稿メニュー"
            >
              <Feather name="more-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Navigation arrows */}
          <View style={postDetailStyles.arrowRow}>
            <TouchableOpacity style={postDetailStyles.arrowButton} onPress={() => movePost(-1)} disabled={posts.length < 2} accessibilityLabel="前の投稿">
              <Feather name="chevron-left" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={postDetailStyles.arrowButton} onPress={() => movePost(1)} disabled={posts.length < 2} accessibilityLabel="次の投稿">
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
              <TouchableOpacity
                style={[postDetailStyles.followButton, following && postDetailStyles.followingButton]}
                onPress={() => setFollowing((value) => !value)}
              >
                <Text style={postDetailStyles.followText}>{following ? "フォロー中" : "フォロー"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={postDetailStyles.caption}>{post.caption}</Text>

            <View style={postDetailStyles.actionsRow}>
              <TouchableOpacity style={postDetailStyles.actionButton} onPress={handleToggleLike}>
                <Feather name="heart" size={20} color={liked ? "#ff3b30" : "#fff"} />
                <Text style={postDetailStyles.actionText}>{likesCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={postDetailStyles.actionButton} onPress={() => Alert.alert("コメント", "コメント機能は現在準備中です") }>
                <Feather name="message-circle" size={20} color="#fff" />
                <Text style={postDetailStyles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={postDetailStyles.actionButton} onPress={handleShare}>
                <Feather name="share-2" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
