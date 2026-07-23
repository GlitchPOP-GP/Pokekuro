import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../store/AppContent";
import { fetchLikedPosts } from "../api/posts";
import { SocialPost } from "../types";

export type ProfileTab = "posts" | "favorites";

export function useProfile() {
  const { user, posts } = useAppContext();

  const [selectedTab, setSelectedTab] = useState<ProfileTab>("posts");
  const [favoritePosts, setFavoritePosts] = useState<SocialPost[]>([]);

  const userPosts = useMemo(() => {
    return posts.filter((post) => post.userId === user.id);
  }, [posts, user.id]);

  // 「お気に入り」タブ（= いいねした投稿）は API から取得する
  useEffect(() => {
    if (selectedTab === "favorites") {
      fetchLikedPosts().then(setFavoritePosts);
    }
  }, [selectedTab]);

  const displayedPosts = useMemo(() => {
    return selectedTab === "posts" ? userPosts : favoritePosts;
  }, [selectedTab, userPosts, favoritePosts]);

  const emptyMessage =
    selectedTab === "posts"
      ? "まだ投稿がありません"
      : "お気に入りはありません";

  return {
    user,
    userPosts,
    displayedPosts,
    selectedTab,
    setSelectedTab,
    emptyMessage,
  };
}
