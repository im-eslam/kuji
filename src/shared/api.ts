const API_BASE = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export type ApiSuccess = {
  ok: true;
  [key: string]: unknown;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApiSuccess(value: unknown): value is ApiSuccess {
  return isRecord(value) && value.ok === true;
}

function readErrorMessage(value: unknown): string | undefined {
  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }
  return undefined;
}

function readErrorCode(value: unknown): string | undefined {
  if (isRecord(value) && typeof value.code === "string") {
    return value.code;
  }
  return undefined;
}

export async function getJson<T>(
  path: string,
  externalSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromCaller, { once: true });
  if (externalSignal?.aborted) controller.abort();

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data: unknown = null;
    if (responseText.trim() !== "") {
      try {
        data = JSON.parse(responseText) as unknown;
      } catch {
        // A proxy may return HTML/plain text. Preserve the HTTP status and use a safe message.
      }
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        readErrorMessage(data) ?? "Request failed",
        readErrorCode(data),
      );
    }

    if (data === null) {
      throw new ApiError(
        response.status,
        "Invalid server response",
        "INVALID_RESPONSE",
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (externalSignal?.aborted) throw error;
    if (controller.signal.aborted)
      throw new ApiError(0, "Request timed out", "TIMEOUT");
    throw new ApiError(0, "Unable to reach the server", "NETWORK_ERROR");
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function postJson<T extends ApiSuccess = ApiSuccess>(
  path: string,
  body: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data: unknown = null;

    if (responseText.trim() !== "") {
      try {
        data = JSON.parse(responseText) as unknown;
      } catch {
        // Error responses may come from a proxy/web server as HTML or plain text.
        // Keep the HTTP status and use a safe fallback instead of trusting the body.
      }
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        readErrorMessage(data) ?? "Request failed",
        readErrorCode(data),
      );
    }

    if (!isApiSuccess(data)) {
      throw new ApiError(
        response.status,
        readErrorMessage(data) ?? "Invalid server response",
        readErrorCode(data) ?? "INVALID_RESPONSE",
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (controller.signal.aborted) {
      throw new ApiError(0, "Request timed out", "TIMEOUT");
    }

    throw new ApiError(0, "Unable to reach the server", "NETWORK_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }
}
