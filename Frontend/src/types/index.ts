export type ClothingCategory = "shirt" | "pants" | "cap" | "bookmark" | "heart";

export interface ClothingItem {
  id: string;
  name: string;
  image: any;
  category: ClothingCategory;
  tags: string[];
  memo?: string;
}

export interface SocialPost {
  id: string;
  image: any;
  userId: string;
  user: string;
  caption: string;
  likes: number;
  comments: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: any;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}
