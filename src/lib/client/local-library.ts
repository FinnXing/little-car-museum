import type { FavoriteRecord, HistoryRecord } from "@/types";

export const LOCAL_LIBRARY_KEYS = {
  favorites: "little-car-museum:favorites",
  history: "little-car-museum:history",
  settings: "little-car-museum:settings",
  schemaVersion: "little-car-museum:schema-version",
} as const;

export const LOCAL_LIBRARY_SCHEMA_VERSION = 1;
export const MAX_FAVORITES = 100;
export const MAX_HISTORY = 20;
export const LOCAL_LIBRARY_CHANGED_EVENT = "little-car-museum:local-change";

type LocalRecord = FavoriteRecord | HistoryRecord;

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseArray(value: string | null): unknown[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ensureSchema(storage: Storage) {
  const currentVersion = storage.getItem(LOCAL_LIBRARY_KEYS.schemaVersion);
  if (currentVersion === String(LOCAL_LIBRARY_SCHEMA_VERSION)) return;

  if (currentVersion === null) {
    const legacyFavorites = parseArray(
      storage.getItem("little-car-museum:favorites:v1"),
    ).filter((value): value is string => typeof value === "string");
    if (legacyFavorites.length > 0) {
      const now = new Date().toISOString();
      storage.setItem(
        LOCAL_LIBRARY_KEYS.favorites,
        JSON.stringify(
          legacyFavorites.slice(0, MAX_FAVORITES).map((vehicleId) => ({
            vehicleId,
            createdAt: now,
          })),
        ),
      );
      storage.removeItem("little-car-museum:favorites:v1");
    }
  } else {
    storage.removeItem(LOCAL_LIBRARY_KEYS.favorites);
    storage.removeItem(LOCAL_LIBRARY_KEYS.history);
    storage.removeItem(LOCAL_LIBRARY_KEYS.settings);
  }

  try {
    storage.setItem(
      LOCAL_LIBRARY_KEYS.schemaVersion,
      String(LOCAL_LIBRARY_SCHEMA_VERSION),
    );
  } catch {
    // A read-only storage still gets the in-memory default behavior.
  }
}

function isRecord(value: unknown): value is { vehicleId: string } {
  if (!value || typeof value !== "object") return false;
  return typeof (value as { vehicleId?: unknown }).vehicleId === "string";
}

function isFavoriteRecord(value: unknown): value is FavoriteRecord {
  return (
    isRecord(value) && typeof (value as FavoriteRecord).createdAt === "string"
  );
}

function isHistoryRecord(value: unknown): value is HistoryRecord {
  return (
    isRecord(value) && typeof (value as HistoryRecord).viewedAt === "string"
  );
}

function readRecords<T extends LocalRecord>(
  key: string,
  validator: (value: unknown) => value is T,
): T[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    ensureSchema(storage);
    return parseArray(storage.getItem(key)).filter(validator);
  } catch {
    return [];
  }
}

function writeRecords<T extends LocalRecord>(key: string, records: T[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    ensureSchema(storage);
    storage.setItem(key, JSON.stringify(records));
    window.dispatchEvent(new Event(LOCAL_LIBRARY_CHANGED_EVENT));
  } catch {
    // Storage failures should never prevent browsing the museum.
  }
}

export function readFavoriteRecords() {
  return readRecords(LOCAL_LIBRARY_KEYS.favorites, isFavoriteRecord);
}

export function readHistoryRecords() {
  return readRecords(LOCAL_LIBRARY_KEYS.history, isHistoryRecord);
}

export function getFavoritesSnapshot() {
  return JSON.stringify(readFavoriteRecords());
}

export function getHistorySnapshot() {
  return JSON.stringify(readHistoryRecords());
}

export function getEmptySnapshot() {
  return "[]";
}

export function subscribeToLocalLibrary(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === LOCAL_LIBRARY_KEYS.favorites ||
      event.key === LOCAL_LIBRARY_KEYS.history ||
      event.key === LOCAL_LIBRARY_KEYS.schemaVersion ||
      event.key === null
    ) {
      onChange();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCAL_LIBRARY_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCAL_LIBRARY_CHANGED_EVENT, onChange);
  };
}

export function toggleFavoriteRecord(vehicleId: string) {
  const current = readFavoriteRecords();
  const exists = current.some((record) => record.vehicleId === vehicleId);
  const next = exists
    ? current.filter((record) => record.vehicleId !== vehicleId)
    : [{ vehicleId, createdAt: new Date().toISOString() }, ...current].slice(
        0,
        MAX_FAVORITES,
      );
  writeRecords(LOCAL_LIBRARY_KEYS.favorites, next);
  return !exists;
}

export function recordVehicleView(vehicleId: string) {
  const next: HistoryRecord[] = [
    { vehicleId, viewedAt: new Date().toISOString() },
    ...readHistoryRecords().filter((record) => record.vehicleId !== vehicleId),
  ].slice(0, MAX_HISTORY);
  writeRecords(LOCAL_LIBRARY_KEYS.history, next);
}

export function replaceFavoriteRecords(records: FavoriteRecord[]) {
  writeRecords(LOCAL_LIBRARY_KEYS.favorites, records.slice(0, MAX_FAVORITES));
}

export function replaceHistoryRecords(records: HistoryRecord[]) {
  writeRecords(LOCAL_LIBRARY_KEYS.history, records.slice(0, MAX_HISTORY));
}

export function clearFavoriteRecords() {
  replaceFavoriteRecords([]);
}

export function clearHistoryRecords() {
  replaceHistoryRecords([]);
}

export function sanitizeFavoriteRecords(
  records: FavoriteRecord[],
  validVehicleIds: ReadonlySet<string>,
) {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (!validVehicleIds.has(record.vehicleId) || seen.has(record.vehicleId)) {
      return false;
    }
    seen.add(record.vehicleId);
    return true;
  });
}

export function sanitizeHistoryRecords(
  records: HistoryRecord[],
  validVehicleIds: ReadonlySet<string>,
) {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (!validVehicleIds.has(record.vehicleId) || seen.has(record.vehicleId)) {
      return false;
    }
    seen.add(record.vehicleId);
    return true;
  });
}
