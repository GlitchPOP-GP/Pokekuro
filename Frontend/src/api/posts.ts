import { SocialPost } from "../types";
import { api, resolveMediaUrl } from "./client";

interface ApiPost {
  id: string | number;
  user_id: string;
  image: string | null;
  caption: string | null;
  likes: number;
  comments: number;
  user: string | null;
}

function toSocialPost(row: ApiPost): SocialPost {
  return {
    id: String(row.id),
    image: { uri: resolveMediaUrl(row.image) },
    userId: row.user_id,
    user: row.user ?? "",
    caption: row.caption ?? "",
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
  };
}

export async function fetchPosts(): Promise<SocialPost[]> {
  try {
    const rows = await api<ApiPost[]>("/api/posts");
    return rows.map(toSocialPost);
  } catch {
    return [];
  }
}

// 自分がいいねした投稿一覧（Profile画面の「お気に入り」タブ用）
export async function fetchLikedPosts(): Promise<SocialPost[]> {
  try {
    const rows = await api<ApiPost[]>("/api/posts/liked", { auth: true });
    return rows.map(toSocialPost);
  } catch {
    return [];
  }
}

export async function likePost(id: string): Promise<void> {
  await api(`/api/posts/${id}/like`, { method: "POST", auth: true });
}

export async function unlikePost(id: string): Promise<void> {
  await api(`/api/posts/${id}/like`, { method: "DELETE", auth: true });
}
