import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { useFavorite } from "@/hooks/useFavorite";

function FavoriteHarness() {
  const { isFavorite, toggleFavorite } = useFavorite("vehicle-1");
  return (
    <button type="button" onClick={toggleFavorite}>
      {isFavorite ? "已收藏" : "未收藏"}
    </button>
  );
}

describe("useFavorite", () => {
  beforeEach(() => localStorage.clear());

  test("persists add and remove actions without requiring an account", () => {
    const { unmount } = render(<FavoriteHarness />);

    fireEvent.click(screen.getByRole("button", { name: "未收藏" }));
    expect(screen.getByRole("button", { name: "已收藏" })).toBeVisible();
    const records = JSON.parse(
      localStorage.getItem("little-car-museum:favorites") ?? "[]",
    );
    expect(records).toHaveLength(1);
    expect(records[0].vehicleId).toBe("vehicle-1");
    expect(records[0].createdAt).toEqual(expect.any(String));

    unmount();
    render(<FavoriteHarness />);
    expect(screen.getByRole("button", { name: "已收藏" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "已收藏" }));
    expect(
      JSON.parse(localStorage.getItem("little-car-museum:favorites") ?? "[]"),
    ).toEqual([]);
  });
});
