import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import HomePage from "@/app/page";

// A smoke test for the TSX transform, @ alias, DOM environment and matchers.
test("renders the preparation page with an accessible title", () => {
  render(<HomePage />);

  expect(screen.getByRole("main")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 1, name: "小小汽车馆" }),
  ).toBeVisible();
  expect(
    screen.getByText("汽车馆正在准备中，期待与你一起探索。"),
  ).toBeVisible();
});
