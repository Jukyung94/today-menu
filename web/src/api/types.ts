export type RecommendationMode = "GUIDED" | "PERSONALIZED_RANDOM";
export type AnswerValue = string | number | boolean;

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
}

export interface QuestionOption {
  value: AnswerValue;
  label: string;
  icon?: string;
  description?: string;
  isFallback?: boolean;
}

export interface RecommendationQuestion {
  key: string;
  text: string;
  description?: string;
  selectionType: "SINGLE" | "MULTIPLE" | "NUMBER";
  options?: QuestionOption[];
  input?: Record<string, unknown>;
}

export interface RecommendationContext {
  contextVersion: number;
  category?: string;
  mealForm?: string;
  tastes?: string[];
  situation?: string;
  budgetMax?: number;
  constraints?: string[];
  location?: string;
  attributes?: Record<string, unknown>;
}

export interface MenuRecommendation {
  resultId: string;
  rank: number;
  food: {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
  };
  reason: string;
  matchedTags: { key: string; label: string }[];
  estimatedPrice?: number;
  matchScore?: number;
}

interface RecommendationSessionBase {
  sessionId: string;
  version: number;
  mode: RecommendationMode;
  context: RecommendationContext;
}

export interface RecommendationInProgress extends RecommendationSessionBase {
  status: "IN_PROGRESS";
  progress: {
    current: number;
    estimatedTotal: number;
  };
  nextQuestion: RecommendationQuestion;
  createdAt: string;
  expiresAt: string;
}

export interface RecommendationCompleted extends RecommendationSessionBase {
  status: "COMPLETED";
  recommendations: MenuRecommendation[];
  completedAt: string;
}

export type RecommendationSession =
  | RecommendationInProgress
  | RecommendationCompleted;

export interface RecommendationEligibility {
  eligible: boolean;
  recordedDays: number;
  requiredDays: number;
}

export interface Upload {
  id: string;
  url?: string;
}

export interface MealLog {
  id: string;
  menuId?: string;
  menuName: string;
  menuEmoji?: string;
  rating: number;
  note?: string;
  photoUrl?: string;
  eatenAt: string;
}

export interface CreateRecommendationSessionInput {
  mode: RecommendationMode;
  locale?: string;
}

export interface SubmitAnswerInput {
  sessionVersion: number;
  questionKey: string;
  selectedValues: AnswerValue[];
}

export interface SubmitFeedbackInput {
  resultId: string;
  actionType:
    | "VIEWED"
    | "SELECTED"
    | "SAVED"
    | "DISLIKED"
    | "DO_NOT_RECOMMEND";
  rating?: number;
}

export interface CreateMealLogInput {
  recommendationResultId?: string;
  foodId?: string;
  customFoodName?: string;
  rating: number;
  note?: string;
  photoIds?: string[];
  eatenAt?: string;
}
