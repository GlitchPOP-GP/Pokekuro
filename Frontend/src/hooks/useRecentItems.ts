import { useMemo } from "react";
import { useAppContext } from "../store/AppContent";

export function useRecentItems() {
  const { closetItems } = useAppContext();
  const recentItems = useMemo(
    () =>
      closetItems
        .filter(
          (item) =>
            item.fittingStatus !== "failed" &&
            !item.originalItemId
        )
        .slice(0, 6),
    [closetItems]
  );

  return { recentItems };
}
