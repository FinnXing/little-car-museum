import { validationError } from "./response";
import type { VehicleListOptions, VehicleSort } from "./public";

const DISPLAY_TYPES = [
  "REAL_3D",
  "GENERIC_3D",
  "IMAGE_SET",
  "STATIC_IMAGE",
] as const;

const SORTS = ["sortOrder", "newest", "name", "relevance"] as const;

function parsePositiveInt(
  value: string | null,
  fallback: number,
  max: number,
  label: string,
) {
  if (value === null || value === "") return fallback;
  if (!/^\d+$/.test(value)) {
    throw validationError(`${label} 必须是正整数。`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) {
    throw validationError(`${label} 超出允许范围。`);
  }
  return parsed;
}

function parseBoolean(value: string | null, label: string) {
  if (value === null || value === "") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw validationError(`${label} 只能是 true 或 false。`);
}

function parseSlug(value: string | null, label: string) {
  if (value === null || value === "") return undefined;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw validationError(`${label} 格式不正确。`);
  }
  return value;
}

export function parseVehicleListOptions(
  request: Request,
  { requireKeyword = false }: { requireKeyword?: boolean } = {},
): VehicleListOptions {
  const searchParams = new URL(request.url).searchParams;
  const keyword = searchParams.get("keyword")?.trim() || undefined;
  const queryKeyword = searchParams.get("q")?.trim() || undefined;
  const normalizedKeyword = queryKeyword ?? keyword;

  if (normalizedKeyword && normalizedKeyword.length > 100) {
    throw validationError("搜索关键词不能超过 100 个字符。");
  }
  if (requireKeyword && !normalizedKeyword) {
    throw validationError("请提供搜索关键词 q。");
  }

  const displayType = searchParams.get("displayType");
  if (
    displayType &&
    !DISPLAY_TYPES.includes(displayType as (typeof DISPLAY_TYPES)[number])
  ) {
    throw validationError("displayType 参数不受支持。");
  }

  const sort = searchParams.get("sort");
  if (sort && !SORTS.includes(sort as (typeof SORTS)[number])) {
    throw validationError("sort 参数不受支持。");
  }

  return {
    page: parsePositiveInt(searchParams.get("page"), 1, 10_000, "page"),
    pageSize: parsePositiveInt(
      searchParams.get("pageSize"),
      20,
      100,
      "pageSize",
    ),
    categorySlug: parseSlug(searchParams.get("category"), "category"),
    brandSlug: parseSlug(searchParams.get("brand"), "brand"),
    displayType: displayType as VehicleListOptions["displayType"],
    isHot: parseBoolean(searchParams.get("isHot"), "isHot"),
    keyword: normalizedKeyword,
    sort:
      (sort as VehicleSort | undefined) ??
      (normalizedKeyword ? "relevance" : "sortOrder"),
  };
}
