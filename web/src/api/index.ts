import type { ApiClient } from "./client";
import { HttpApiClient } from "./httpClient";
import { MockApiClient } from "./mockClient";
import { readAuthSession, saveAuthSession } from "./storage";

const apiMode = import.meta.env.VITE_API_MODE ?? "mock";
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient: ApiClient =
  apiMode === "http"
    ? new HttpApiClient(baseUrl, () => readAuthSession()?.accessToken ?? null)
    : new MockApiClient();

export async function ensureGuestAuth() {
  const existing = readAuthSession();
  if (existing) return existing;

  const session = await apiClient.authenticateGuest();
  saveAuthSession(session);
  return session;
}

export { ApiError } from "./client";
export type { ApiClient, ApiErrorCode } from "./client";
export {
  clearRecommendationSessionId,
  readRecommendationSessionId,
  saveRecommendationSessionId,
} from "./storage";
export type * from "./types";
