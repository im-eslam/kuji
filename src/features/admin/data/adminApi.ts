import { ApiError, getJson, postJson, type ApiSuccess } from "@/shared/api";
import { expireSession, sessionEpoch } from "./session";

async function withExpiry<T>(request: () => Promise<T>): Promise<T> {
  const epoch = sessionEpoch();
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      expireSession(epoch);
    }
    throw error;
  }
}

export function adminGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return withExpiry(() => getJson<T>(path, signal));
}

export function adminPost<T extends ApiSuccess = ApiSuccess>(
  path: string,
  body: unknown,
): Promise<T> {
  return withExpiry(() => postJson<T>(path, body));
}
