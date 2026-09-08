import { expect, test } from "@playwright/test";

test("serves the preparation page without runtime errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("小小汽车馆 | Little Car Museum");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(
    page.getByRole("heading", { name: "小小汽车馆", level: 1 }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("keeps draft fixture vehicles out of the production car list", async ({
  page,
}) => {
  const response = await page.goto("/cars");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("汽车展厅 | 小小汽车馆");
  await expect(
    page.getByRole("heading", { name: "今天想认识 哪辆汽车？" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "这里还没有汽车" }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
