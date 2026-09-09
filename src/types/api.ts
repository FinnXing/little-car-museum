import type {
  AssetLicense,
  Brand,
  Category,
  ContentStatus,
  DisplayType,
  Vehicle,
} from "./content";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SLUG_CONFLICT"
  | "ASSET_LICENSE_REQUIRED"
  | "ASSET_LICENSE_REJECTED"
  | "PUBLISH_CHECK_FAILED"
  | "FILE_TYPE_NOT_ALLOWED"
  | "FILE_TOO_LARGE"
  | "MODEL_PROCESS_FAILED"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  requestId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface VehicleSummary {
  id: string;
  slug: string;
  brandId?: string;
  brand?: Pick<Brand, "id" | "slug" | "nameCn" | "nameEn">;
  categoryIds: string[];
  nameCn: string;
  nameEn?: string;
  childName?: string;
  displayType: DisplayType;
  isRealModel: boolean;
  coverImageUrl: string;
  thumbnailUrl?: string;
  isHot: boolean;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDetail extends Vehicle {
  brand?: Brand;
  categories: Category[];
  licenses: AssetLicense[];
}
