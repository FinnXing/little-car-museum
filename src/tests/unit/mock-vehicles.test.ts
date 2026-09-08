import { describe, expect, test } from "vitest";
import {
  MOCK_DATA_NOTICE,
  mockCategories,
  mockVehicles,
} from "@/lib/data/mock-vehicles";

describe("development vehicle fixtures", () => {
  test("contains five explicitly marked generic draft vehicles", () => {
    expect(MOCK_DATA_NOTICE).toBe("DEVELOPMENT_PLACEHOLDER_ONLY");
    expect(mockVehicles).toHaveLength(5);

    for (const vehicle of mockVehicles) {
      expect(vehicle.id).toMatch(/^placeholder-/);
      expect(vehicle.slug).toMatch(/^placeholder-/);
      expect(vehicle.displayType).toBe("GENERIC_3D");
      expect(vehicle.isRealModel).toBe(false);
      expect(vehicle.status).toBe("DRAFT");
      expect("brandId" in vehicle).toBe(false);
      expect(vehicle.coverImageUrl).toContain("/placeholders/");
      expect(vehicle.fallbackImageUrls).not.toHaveLength(0);
      expect(vehicle.assetLicenseIds).toEqual([]);
    }
  });

  test("uses unique IDs and only references placeholder categories", () => {
    const categoryIds = new Set(mockCategories.map(({ id }) => id));
    const vehicleIds = mockVehicles.map(({ id }) => id);
    const vehicleSlugs = mockVehicles.map(({ slug }) => slug);

    expect(new Set(vehicleIds).size).toBe(vehicleIds.length);
    expect(new Set(vehicleSlugs).size).toBe(vehicleSlugs.length);

    for (const vehicle of mockVehicles) {
      expect(vehicle.categoryIds.length).toBeGreaterThan(0);
      expect(vehicle.categoryIds.every((id) => categoryIds.has(id))).toBe(true);
    }
  });

  test("does not claim official colors for generic vehicles", () => {
    for (const vehicle of mockVehicles) {
      expect(
        vehicle.colors.every(({ isOfficialColor }) => !isOfficialColor),
      ).toBe(true);
    }
  });
});
