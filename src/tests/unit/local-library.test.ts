import { beforeEach, describe, expect, test } from "vitest";
import {
  LOCAL_LIBRARY_KEYS,
  MAX_FAVORITES,
  MAX_HISTORY,
  readFavoriteRecords,
  readHistoryRecords,
  recordVehicleView,
  sanitizeFavoriteRecords,
  sanitizeHistoryRecords,
  toggleFavoriteRecord,
} from "@/lib/client/local-library";

describe("local-library", () => {
  beforeEach(() => localStorage.clear());

  test("migrates the previous favorite key into versioned records", () => {
    localStorage.setItem(
      "little-car-museum:favorites:v1",
      JSON.stringify(["vehicle-1"]),
    );

    expect(readFavoriteRecords()).toHaveLength(1);
    expect(readFavoriteRecords()[0]).toMatchObject({ vehicleId: "vehicle-1" });
    expect(localStorage.getItem(LOCAL_LIBRARY_KEYS.schemaVersion)).toBe("1");
  });

  test("recovers from corrupt data and incompatible schema versions", () => {
    localStorage.setItem(LOCAL_LIBRARY_KEYS.favorites, "not-json");
    expect(readFavoriteRecords()).toEqual([]);

    localStorage.setItem(LOCAL_LIBRARY_KEYS.schemaVersion, "999");
    localStorage.setItem(
      LOCAL_LIBRARY_KEYS.history,
      JSON.stringify([{ vehicleId: "vehicle-1", viewedAt: "today" }]),
    );
    expect(readHistoryRecords()).toEqual([]);
  });

  test("caps favorites and deduplicates recent history", () => {
    for (let index = 0; index < MAX_FAVORITES + 5; index += 1) {
      toggleFavoriteRecord(`vehicle-${index}`);
    }
    expect(readFavoriteRecords()).toHaveLength(MAX_FAVORITES);
    expect(readFavoriteRecords()[0].vehicleId).toBe("vehicle-104");

    recordVehicleView("vehicle-a");
    recordVehicleView("vehicle-b");
    recordVehicleView("vehicle-a");
    expect(readHistoryRecords().map((record) => record.vehicleId)).toEqual([
      "vehicle-a",
      "vehicle-b",
    ]);
    expect(readHistoryRecords().length).toBeLessThanOrEqual(MAX_HISTORY);
  });

  test("removes deleted vehicles while preserving valid order", () => {
    const validIds = new Set(["vehicle-1", "vehicle-2"]);
    expect(
      sanitizeFavoriteRecords(
        [
          { vehicleId: "vehicle-1", createdAt: "1" },
          { vehicleId: "missing", createdAt: "2" },
          { vehicleId: "vehicle-1", createdAt: "3" },
        ],
        validIds,
      ),
    ).toEqual([{ vehicleId: "vehicle-1", createdAt: "1" }]);
    expect(
      sanitizeHistoryRecords(
        [{ vehicleId: "missing", viewedAt: "1" }],
        validIds,
      ),
    ).toEqual([]);
  });
});
