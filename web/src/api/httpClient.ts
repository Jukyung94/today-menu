import { ApiError, type ApiClient, type ApiErrorCode } from "./client";
import type {
  AuthSession,
  CreateMealLogInput,
  CreateRecommendationSessionInput,
  MealLog,
  RecommendationEligibility,
  RecommendationSession,
  SubmitAnswerInput,
  SubmitFeedbackInput,
  Upload,
} from "./types";

interface ErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

const knownErrorCodes = new Set<ApiErrorCode>([
  "AUTH_REQUIRED",
  "SESSION_EXPIRED",
  "SESSION_VERSION_CONFLICT",
  "NETWORK_ERROR",
  "VALIDATION_ERROR",
  "UNKNOWN",
]);

function errorCode(payload: ErrorPayload, status: number): ApiErrorCode {
  const code = payload.error?.code;
  if (
    code &&
    knownErrorCodes.has(code as ApiErrorCode)
  ) {
    return code as ApiErrorCode;
  }
  if (status === 401) return "AUTH_REQUIRED";
  if (status === 409) return "SESSION_VERSION_CONFLICT";
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  return "UNKNOWN";
}

function unwrap<T>(payload: T | { data: T }): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload
  ) {
    return payload.data;
  }
  return payload;
}

export class HttpApiClient implements ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => string | null;

  constructor(
    baseUrl: string,
    getAccessToken: () => string | null,
  ) {
    this.baseUrl = baseUrl;
    this.getAccessToken = getAccessToken;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    authenticated = true,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    const token = this.getAccessToken();
    if (authenticated && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (init.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    if (init.method && init.method !== "GET") {
      headers.set("Idempotency-Key", crypto.randomUUID());
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
      });
    } catch {
      throw new ApiError(
        "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        "NETWORK_ERROR",
      );
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as ErrorPayload;
      throw new ApiError(
        payload.error?.message ?? "요청을 처리하지 못했습니다.",
        errorCode(payload, response.status),
        response.status,
      );
    }

    if (response.status === 204) return undefined as T;
    return unwrap((await response.json()) as T | { data: T });
  }

  authenticateGuest() {
    return this.request<AuthSession>(
      "/auth/guest",
      { method: "POST" },
      false,
    );
  }

  createRecommendationSession(input: CreateRecommendationSessionInput) {
    return this.request<RecommendationSession>("/recommendation-sessions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getRecommendationSession(sessionId: string) {
    return this.request<RecommendationSession>(
      `/recommendation-sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  submitAnswer(sessionId: string, input: SubmitAnswerInput) {
    return this.request<RecommendationSession>(
      `/recommendation-sessions/${encodeURIComponent(sessionId)}/answers`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  }

  async submitFeedback(input: SubmitFeedbackInput) {
    await this.request<unknown>("/recommendation-feedback", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  upload(file: File) {
    const body = new FormData();
    body.append("file", file);
    return this.request<Upload>("/uploads", { method: "POST", body });
  }

  createMealLog(input: CreateMealLogInput) {
    return this.request<MealLog>("/meal-logs", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  listMealLogs() {
    return this.request<MealLog[]>("/meal-logs");
  }

  getRecommendationEligibility() {
    return this.request<RecommendationEligibility>(
      "/preferences/recommendation-eligibility",
    );
  }
}
