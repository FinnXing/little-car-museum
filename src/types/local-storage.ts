import type { ModelQuality } from "./viewer";

export interface FavoriteRecord {
  vehicleId: string;
  createdAt: string;
}

export interface HistoryRecord {
  vehicleId: string;
  viewedAt: string;
}

export interface LocalSettings {
  soundEnabled: boolean;
  autoRotateEnabled: boolean;
  preferredQuality: ModelQuality;
  usageReminderMinutes: 0 | 15 | 30 | 45;
}
