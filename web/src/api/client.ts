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

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "SESSION_EXPIRED"
  | "SESSION_VERSION_CONFLICT"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(
    message: string,
    code: ApiErrorCode,
    status?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export interface ApiClient {
  authenticateGuest(): Promise<AuthSession>;
  createRecommendationSession(
    input: CreateRecommendationSessionInput,
  ): Promise<RecommendationSession>;
  getRecommendationSession(
    sessionId: string,
  ): Promise<RecommendationSession>;
  submitAnswer(
    sessionId: string,
    input: SubmitAnswerInput,
  ): Promise<RecommendationSession>;
  submitFeedback(input: SubmitFeedbackInput): Promise<void>;
  upload(file: File): Promise<Upload>;
  createMealLog(input: CreateMealLogInput): Promise<MealLog>;
  listMealLogs(): Promise<MealLog[]>;
  getRecommendationEligibility(): Promise<RecommendationEligibility>;
}
