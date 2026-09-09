import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { VehicleExplorer } from "@/components/car/VehicleExplorer";
import { VehicleListError } from "@/components/car/VehicleListError";
import { VehicleListSkeleton } from "@/components/car/VehicleListSkeleton";
import { mockCategories, mockVehicles } from "@/lib/data/mock-vehicles";

describe("VehicleExplorer", () => {
  test("renders vehicle cards with required summary fields", () => {
    render(
      <VehicleExplorer
        categories={mockCategories}
        vehicles={mockVehicles}
        isDevelopmentPreview
      />,
    );

    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "红色闪电跑车" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: "查看红色闪电跑车详情" }),
    ).toHaveAttribute("href", "/cars/placeholder-red-lightning-sports-car");
    expect(screen.getAllByText("通用 3D")).toHaveLength(5);
    expect(screen.getAllByText("未收藏")).toHaveLength(5);
    expect(screen.getByText(/不计入正式上线车辆/)).toBeVisible();
  });

  test("filters vehicles by one category and can clear the filter", () => {
    render(
      <VehicleExplorer categories={mockCategories} vehicles={mockVehicles} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "SUV" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "绿色探险 SUV" })).toBeVisible();
    expect(screen.getByText("找到 1 辆")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "全部汽车" }));
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });

  test("shows an actionable empty state", () => {
    render(<VehicleExplorer categories={mockCategories} vehicles={[]} />);

    expect(
      screen.getByRole("heading", { name: "这里还没有汽车" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

test("loading state exposes busy status", () => {
  render(<VehicleListSkeleton />);
  expect(screen.getByLabelText("汽车列表正在加载")).toHaveAttribute(
    "aria-busy",
    "true",
  );
});

test("error state lets the visitor retry", () => {
  const onRetry = vi.fn();
  render(<VehicleListError onRetry={onRetry} />);

  fireEvent.click(screen.getByRole("button", { name: "再试一次" }));
  expect(onRetry).toHaveBeenCalledOnce();
  expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute(
    "href",
    "/",
  );
});
