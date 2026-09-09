import { describe, expect, it } from "vitest";
import { buildPublicVehicleWhere } from "@/lib/api/public";
import { parseVehicleListOptions } from "@/lib/api/query";
import { ApiRequestError } from "@/lib/api/response";

describe("public API query helpers", () => {
  it("parses filters, pagination, and search sorting", () => {
    const options = parseVehicleListOptions(
      new Request(
        "http://localhost/api/v1/vehicles?category=suv&brand=toyota&displayType=REAL_3D&isHot=true&page=2&pageSize=12&keyword=越野",
      ),
    );

    expect(options).toEqual({
      page: 2,
      pageSize: 12,
      categorySlug: "suv",
      brandSlug: "toyota",
      displayType: "REAL_3D",
      isHot: true,
      keyword: "越野",
      sort: "relevance",
    });
  });

  it("rejects invalid filters and missing required search text", () => {
    expect(() =>
      parseVehicleListOptions(
        new Request("http://localhost/api/v1/vehicles?pageSize=101"),
      ),
    ).toThrowError(ApiRequestError);

    expect(() =>
      parseVehicleListOptions(new Request("http://localhost/api/v1/search"), {
        requireKeyword: true,
      }),
    ).toThrowError("请提供搜索关键词 q。");
  });

  it("builds a published-only Prisma filter", () => {
    expect(
      buildPublicVehicleWhere({
        categorySlug: "suv",
        brandSlug: "toyota",
        displayType: "REAL_3D",
        isHot: true,
        keyword: "越野",
      }),
    ).toEqual({
      status: "PUBLISHED",
      categories: {
        some: { category: { slug: "suv", enabled: true } },
      },
      brand: { slug: "toyota", status: "PUBLISHED" },
      displayType: "REAL_3D",
      isHot: true,
      OR: [
        { nameCn: { contains: "越野", mode: "insensitive" } },
        { nameEn: { contains: "越野", mode: "insensitive" } },
        { childName: { contains: "越野", mode: "insensitive" } },
        { aliases: { has: "越野" } },
        { tags: { has: "越野" } },
      ],
    });
  });
});
