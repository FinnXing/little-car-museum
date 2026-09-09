import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getCategories } from "@/app/api/v1/categories/route";
import { GET as getVehicle } from "@/app/api/v1/vehicles/[slug]/route";
import { GET as searchVehicles } from "@/app/api/v1/search/route";
import { getPublicVehicleBySlug, listPublicCategories } from "@/lib/api/public";

vi.mock("@/lib/api/public", () => ({
  getPublicVehicleBySlug: vi.fn(),
  listPublicCategories: vi.fn(),
  listPublicVehicles: vi.fn(),
}));

describe("public API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the unified success envelope", async () => {
    vi.mocked(listPublicCategories).mockResolvedValue([]);

    const response = await getCategories();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: [] });
  });

  it("returns NOT_FOUND without exposing implementation details", async () => {
    vi.mocked(getPublicVehicleBySlug).mockResolvedValue(null);

    const response = await getVehicle(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "missing-car" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("没有找到这辆汽车。");
    expect(body.error.requestId).toEqual(expect.any(String));
    expect(body.error.message).not.toContain("Prisma");
  });

  it("validates the required search query", async () => {
    const response = await searchVehicles(
      new Request("http://localhost/api/v1/search"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "请提供搜索关键词 q。" },
    });
  });
});
