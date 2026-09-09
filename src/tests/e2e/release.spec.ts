import { expect, test } from "@playwright/test";

test("publishes privacy and credits pages with accessible structure", async ({
  page,
}) => {
  for (const [path, title, heading] of [
    ["/privacy", "隐私说明 | 小小汽车馆", "隐私说明"],
    ["/credits", "素材与感谢 | 小小汽车馆", "素材与感谢"],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: heading, level: 1 }),
    ).toBeVisible();
    expect(
      await page
        .locator("button")
        .evaluateAll((buttons) =>
          buttons.every((button) =>
            Boolean(
              button.textContent?.trim() || button.getAttribute("aria-label"),
            ),
          ),
        ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("protects admin pages and sends baseline security headers", async ({
  page,
}) => {
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  expect(page.url()).toContain("/admin/login");
  await expect(page.getByRole("heading", { name: "管理员登录" })).toBeVisible();

  const apiResponse = await page.request.get("/api/v1/admin/assets");
  expect(apiResponse.status()).toBe(401);
  await expect(apiResponse.json()).resolves.toMatchObject({
    success: false,
    error: { code: "UNAUTHORIZED" },
  });

  const securityResponse = await page.request.get("/");
  const headers = securityResponse.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");

  const robots = await page.request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /admin");
  expect(robotsText).toContain("Disallow: /api/");
});
