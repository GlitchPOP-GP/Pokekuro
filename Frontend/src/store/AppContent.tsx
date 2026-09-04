import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ClosetItem } from "../types/closet";
import { SocialPost } from "../types";
import { useAuth } from "./AuthContext";
import { fetchClosetItems } from "../api/closet";
import { fetchPosts } from "../api/posts";
import { fetchMyProfile } from "../api/profile";

interface AppUser {
  id: string;
  name: string;
  avatar: any;
}

interface AppContextType {
  // クローゼットアイテム（API から取得）
  closetItems: ClosetItem[];
  addClosetItem: (item: {
    name?: string;
    image: any;
    category?: ClosetItem["category"];
    tags?: string[];
    itemType?: ClosetItem["itemType"];
    originalItemId?: string;
  }) => void;
  keepPost: (post: SocialPost) => void;
  isPostKept: (postId: string) => boolean;
  removeClosetItem: (item: ClosetItem) => void;
  refreshCloset: () => void;
  // ソーシャルフィード（API から取得）
  posts: SocialPost[];
  // ログインユーザー（API から取得）
  user: AppUser;
}

const AppContext = createContext<AppContextType | null>(null);

const EMPTY_USER: AppUser = { id: "", name: "", avatar: undefined };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user: authUser } = useAuth();

  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [user, setUser] = useState<AppUser>(EMPTY_USER);
  const deletedItemIds = useRef(new Set<string>());

  const refreshCloset = useCallback(() => {
    fetchClosetItems().then((serverItems) => {
      setClosetItems((currentItems) => {
        const locallyKeptItems = currentItems.filter((item) =>
          item.originalItemId?.startsWith("post:")
        );
        const currentServerItems = serverItems.filter((item) => {
          const effectiveId = item.originalItemId ?? item.id;
          return !deletedItemIds.current.has(effectiveId);
        });
        return [...locallyKeptItems, ...currentServerItems];
      });
    });
  }, []);

  const hasGeneratingItem = closetItems.some(
    (item) => item.fittingStatus === "pending" || item.fittingStatus === "processing"
  );

  // 生成画面を離れた後も、Gemini画像や失敗状態を一覧へ自動反映する。
  useEffect(() => {
    if (!isAuthenticated || !hasGeneratingItem) return;
    const timer = setInterval(refreshCloset, 3000);
    return () => clearInterval(timer);
  }, [hasGeneratingItem, isAuthenticated, refreshCloset]);

  // ログイン後にサーバーから各データを取得する（未ログイン時は空）
  useEffect(() => {
    if (!isAuthenticated) {
      setClosetItems([]);
      setPosts([]);
      setUser(EMPTY_USER);
      return;
    }
    fetchClosetItems().then(setClosetItems);
    fetchPosts().then(setPosts);
    fetchMyProfile().then((p) => {
      if (p) setUser({ id: p.id, name: p.name, avatar: p.avatar });
    });
  }, [isAuthenticated, authUser?.id]);

  // 追加は楽観的にローカル反映（実際の永続化は useItemAdd 側の API 呼び出しが担う）
  const addClosetItem: AppContextType["addClosetItem"] = (item) => {
    setClosetItems((prev) => {
      if (
        item.originalItemId &&
        prev.some((entry) => entry.originalItemId === item.originalItemId)
      ) {
        return prev;
      }

      return [
        {
          id: Date.now().toString(),
          name: item.name ?? "",
          image: item.image,
          category: item.category ?? "shirt",
          tags: item.tags ?? [],
          itemType: item.itemType ?? "shirt",
          originalItemId: item.originalItemId,
        },
        ...prev,
      ];
    });
  };

  const keepPost = (post: SocialPost) => {
    const itemName = post.caption.replace(/#[^\s#]+/g, "").trim();

    addClosetItem({
      name: itemName || `${post.user}のアイテム`,
      image: post.image,
      category: "shirt",
      itemType: "shirt",
      tags: ["ショップ"],
      originalItemId: `post:${post.id}`,
    });
  };

  const isPostKept = (postId: string) =>
    closetItems.some((item) => item.originalItemId === `post:${postId}`);

  const removeClosetItem = (item: ClosetItem) => {
    const effectiveId = item.originalItemId ?? item.id;
    deletedItemIds.current.add(effectiveId);
    setClosetItems((currentItems) =>
      currentItems.filter(
        (entry) => entry.id !== effectiveId && entry.originalItemId !== effectiveId
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        closetItems,
        addClosetItem,
        keepPost,
        isPostKept,
        removeClosetItem,
        refreshCloset,
        posts,
        user,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
