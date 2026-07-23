import { useState, useEffect } from "react";
import { ClosetItem } from "../types/closet";
import { fetchRecentClosetItems } from "../api/closet";

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<ClosetItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchRecentClosetItems().then((items) => {
      if (active) {
        setRecentItems(items);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { recentItems };
}
