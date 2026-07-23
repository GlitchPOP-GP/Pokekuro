import { api, resolveMediaUrl } from "./client";

export interface TodayPick {
  id: string;
  thumbnail: string;
  video: string;
  user: string;
  title: string;
}

interface ApiTodayPick {
  id: string | number;
  thumbnail: string;
  video: string;
  user_name: string;
  title: string;
}

export async function fetchTodayPicks(): Promise<TodayPick[]> {
  try {
    const rows = await api<ApiTodayPick[]>("/api/today-picks");
    return rows.map((row) => ({
      id: String(row.id),
      thumbnail: resolveMediaUrl(row.thumbnail),
      video: resolveMediaUrl(row.video),
      user: row.user_name,
      title: row.title,
    }));
  } catch {
    return [];
  }
}
