export interface ClosetItem {
  id: string;
  name: string;
  image: any;
  category: "shirt" | "pants" | "cap" | "bookmark" | "heart";
  tags: string[];
  itemType: "shirt" | "pants" | "cap";
  originalItemId?: string;
  // 3Dフィッティング済みの服単体GLB（生成が完了していれば入る。未完了/未生成ならnull）
  glbUrl?: string | null;
  fittingStatus?: "pending" | "processing" | "awaiting_approval" | "done" | "failed" | null;
  hasGeneratedPreview?: boolean;
}
