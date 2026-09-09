"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getEmptySnapshot,
  getFavoritesSnapshot,
  subscribeToLocalLibrary,
  toggleFavoriteRecord,
} from "@/lib/client/local-library";

export function useFavorite(vehicleId: string) {
  const snapshot = useSyncExternalStore(
    subscribeToLocalLibrary,
    getFavoritesSnapshot,
    getEmptySnapshot,
  );
  const records = JSON.parse(snapshot) as Array<{ vehicleId: string }>;
  const isFavorite = records.some((record) => record.vehicleId === vehicleId);

  const toggleFavorite = useCallback(() => {
    toggleFavoriteRecord(vehicleId);
  }, [vehicleId]);

  return { isFavorite, toggleFavorite };
}
