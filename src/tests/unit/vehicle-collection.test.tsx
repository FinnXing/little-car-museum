import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { VehicleCollection } from "@/components/library/VehicleCollection";
import { LOCAL_LIBRARY_KEYS } from "@/lib/client/local-library";
import { mockVehicles } from "@/lib/data/mock-vehicles";

describe("VehicleCollection", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LOCAL_LIBRARY_KEYS.schemaVersion, "1");
  });

  test("renders valid favorite records and can clear them", () => {
    localStorage.setItem(
      LOCAL_LIBRARY_KEYS.favorites,
      JSON.stringify([
        {
          vehicleId: mockVehicles[0].id,
          createdAt: "2026-09-09T00:00:00.000Z",
        },
      ]),
    );

    render(<VehicleCollection kind="favorites" vehicles={[mockVehicles[0]]} />);

    expect(screen.getByRole("heading", { name: "红色闪电跑车" })).toBeVisible();
    expect(screen.getByRole("button", { name: "清空收藏" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "清空收藏" }));
    expect(
      screen.getByRole("heading", { name: "还没有收藏汽车" }),
    ).toBeVisible();
  });
});
