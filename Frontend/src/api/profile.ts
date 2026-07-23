import { api, resolveMediaUrl } from "./client";

export interface MyProfile {
  id: string;
  name: string;
  avatar: { uri: string };
  height: number | null;
  bodyType: string | null;
  gender: string | null;
  email: string;
}

interface ApiProfile {
  user_id: string;
  user_name: string;
  profile_image: string | null;
  height: number | null;
  body_type: string | null;
  gender: string | null;
  email: string;
}

export async function fetchMyProfile(): Promise<MyProfile | null> {
  try {
    const row = await api<ApiProfile>("/api/profiles/me", { auth: true });
    return {
      id: row.user_id,
      name: row.user_name,
      avatar: { uri: resolveMediaUrl(row.profile_image) },
      height: row.height,
      bodyType: row.body_type,
      gender: row.gender,
      email: row.email,
    };
  } catch {
    return null;
  }
}
