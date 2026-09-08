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
