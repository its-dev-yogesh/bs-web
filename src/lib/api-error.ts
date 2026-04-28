import { AxiosError } from "axios";

export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: ApiFieldErrors;
  cause?: unknown;

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    fieldErrors?: ApiFieldErrors;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
    this.cause = params.cause;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isValidation() {
    return this.status === 422 || !!this.fieldErrors;
  }
  get isNetwork() {
    return this.status === 0;
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { message?: string; code?: string; errors?: ApiFieldErrors }
      | undefined;
    return new ApiError({
      message: data?.message ?? err.message ?? "Request failed",
      status: err.response?.status ?? 0,
      code: data?.code,
      fieldErrors: data?.errors,
      cause: err,
    });
  }

  if (err instanceof Error) {
    return new ApiError({ message: err.message, status: 0, cause: err });
  }

  return new ApiError({ message: "Unknown error", status: 0, cause: err });
}
