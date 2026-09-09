import { NextResponse } from "next/server";
import type { ApiErrorCode, ApiResponse } from "@/types";

export class ApiRequestError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

function createRequestId() {
  return globalThis.crypto.randomUUID();
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  requestId = createRequestId(),
) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: { code, message, requestId },
    },
    {
      status,
      headers: { "x-request-id": requestId },
    },
  );
}

export async function withApiErrors<T>(handler: () => Promise<T>) {
  const requestId = createRequestId();

  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return apiError(error.code, error.message, error.status, requestId);
    }

    console.error(`[api:${requestId}]`, error);
    return apiError(
      "INTERNAL_ERROR",
      "服务暂时不可用，请稍后再试。",
      500,
      requestId,
    );
  }
}

export function notFound(message = "请求的内容不存在。") {
  return new ApiRequestError("NOT_FOUND", message, 404);
}

export function validationError(message: string) {
  return new ApiRequestError("VALIDATION_ERROR", message, 400);
}
