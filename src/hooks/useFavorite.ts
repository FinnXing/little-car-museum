"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "little-car-museum:favorites:v1";

function readFavoriteIds() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(FAVORITES_KEY) ?? "[]",
    );
    return Array.isArray(stored) &&
      stored.every((value) => typeof value === "string")
      ? stored
      : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing or a full storage quota should not block detail viewing.
  }
}

export function useFavorite(vehicleId: string) {
  const [isFavorite, setIsFavorite] = useState(() =>
    readFavoriteIds().includes(vehicleId),
  );

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_KEY)
        setIsFavorite(readFavoriteIds().includes(vehicleId));
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [vehicleId]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((current) => {
      const next = new Set(readFavoriteIds());
      if (current) next.delete(vehicleId);
      else next.add(vehicleId);
      writeFavoriteIds([...next]);
      return !current;
    });
  }, [vehicleId]);

  return { isFavorite, toggleFavorite };
}
