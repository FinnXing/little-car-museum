import { describe, expect, it } from "vitest";
import {
  parseCategoryInput,
  parseVehicleInput,
  validateVehicleForPublish,
} from "@/lib/admin/validation";
import { ApiRequestError } from "@/lib/api/response";

const approvedLicense = {
  assetLicense: {
    reviewStatus: "APPROVED" as const,
    allowPublicDisplay: true,
    authorName: "Open source author",
    sourcePageUrl: "https://example.com/source",
    licenseName: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    licenseFileUrl: null,
    acquiredAt: new Date("2026-09-09T00:00:00.000Z"),
  },
};

const publishableVehicle = {
  status: "DRAFT" as const,
  slug: "toy-car",
  nameCn: "小汽车",
  childDescription: "一辆适合观察的小汽车。",
  coverImageUrl: "https://example.com/toy-car.webp",
  displayType: "STATIC_IMAGE" as const,
  isRealModel: false,
  brandId: null,
  highModelUrl: null,
  lowModelUrl: null,
  fallbackImageUrls: ["https://example.com/toy-car.webp"],
  categories: [{ categoryId: "category-1" }],
  assetLicenses: [approvedLicense],
};

describe("admin content publish validation", () => {
  it("accepts a complete static image vehicle", () => {
    expect(validateVehicleForPublish(publishableVehicle)).toEqual([]);
  });

  it("requires matching model flags and enough image resources", () => {
    expect(
      validateVehicleForPublish({
        ...publishableVehicle,
        displayType: "GENERIC_3D" as const,
        isRealModel: true,
        fallbackImageUrls: [],
      }),
    ).toEqual(
      expect.arrayContaining([
        "GENERIC_3D 不能标记为真实车型",
        "通用 3D 车型至少需要一套模型资源",
      ]),
    );

    expect(
      validateVehicleForPublish({
        ...publishableVehicle,
        displayType: "IMAGE_SET" as const,
        fallbackImageUrls: ["one", "two"],
      }),
    ).toContain("图片组至少需要 3 张不同角度的图片");
  });

  it("requires an approved, traceable license", () => {
    expect(
      validateVehicleForPublish({
        ...publishableVehicle,
        assetLicenses: [],
      }),
    ).toEqual(expect.arrayContaining(["至少关联一条素材许可证"]));

    expect(
      validateVehicleForPublish({
        ...publishableVehicle,
        assetLicenses: [
          {
            assetLicense: {
              ...approvedLicense.assetLicense,
              reviewStatus: "PENDING" as const,
              licenseUrl: null,
              licenseFileUrl: null,
            },
          },
        ],
      }),
    ).toEqual(
      expect.arrayContaining([
        "素材许可证必须补齐作者、来源、许可证链接或副本和获取日期",
        "所有关联素材许可证必须审核通过并允许公开展示",
      ]),
    );
  });

  it("keeps PATCH fields optional while validating required create fields", () => {
    expect(
      parseVehicleInput({ nameCn: "只改名称" }, { partial: true }),
    ).toEqual({
      nameCn: "只改名称",
      brandId: undefined,
      nameEn: undefined,
      childName: undefined,
      aliases: undefined,
      tags: undefined,
      displayType: undefined,
      isRealModel: undefined,
      energyType: undefined,
      seatCount: undefined,
      childDescription: undefined,
      coverImageUrl: undefined,
      thumbnailUrl: undefined,
      highModelUrl: undefined,
      lowModelUrl: undefined,
      fallbackImageUrls: undefined,
      pronunciationAudioUrl: undefined,
      defaultCamera: undefined,
      colors: undefined,
      hotspots: undefined,
      isHot: undefined,
      sortOrder: undefined,
      status: undefined,
      assetLicenseIds: undefined,
      slug: undefined,
      categoryIds: undefined,
    });

    expect(() =>
      parseCategoryInput({ slug: "Bad Slug", nameCn: "分类" }),
    ).toThrowError(ApiRequestError);
  });
});
