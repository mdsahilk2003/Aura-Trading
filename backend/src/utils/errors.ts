import { ERROR_CODES, type ApiErrorResponse, type ApiSuccessResponse } from "@aura/shared";

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function success<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function failure(
  message: string,
  code: string,
  details?: unknown
): ApiErrorResponse {
  return details !== undefined
    ? { success: false, message, code, details }
    : { success: false, message, code };
}

export function assertFound<T>(value: T | null | undefined, message = "Not found"): T {
  if (value == null) {
    throw new AppError(message, 404, ERROR_CODES.NOT_FOUND);
  }
  return value;
}
