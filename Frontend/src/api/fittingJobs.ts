import { api, resolveMediaUrl } from "./client";

export type FittingStatus = "pending" | "processing" | "awaiting_approval" | "done" | "failed";

export interface FittingJob {
  id: string | number;
  clothing_item_id: string | number;
  category: "shirt" | "pants";
  status: FittingStatus;
  gemini_image_path: string | null;
  fitted_glb_path: string | null;
  error_message: string | null;
}

export async function createFittingJob(
  clothingItemId: string | number,
  category: "shirt" | "pants"
): Promise<FittingJob> {
  return api<FittingJob>("/api/fitting-jobs", {
    method: "POST",
    auth: true,
    body: { clothing_item_id: clothingItemId, category },
  });
}

export async function getFittingJob(id: string | number): Promise<FittingJob> {
  return api<FittingJob>(`/api/fitting-jobs/${id}`, { auth: true });
}

// Gemini生成画像を確認した後、続き（Meshy→Blenderフィッティング）を開始する
export async function approveFittingJob(id: string | number): Promise<FittingJob> {
  return api<FittingJob>(`/api/fitting-jobs/${id}/approve`, { method: "POST", auth: true });
}

export function resolveGeminiImageUrl(job: FittingJob): string {
  return resolveMediaUrl(job.gemini_image_path);
}
