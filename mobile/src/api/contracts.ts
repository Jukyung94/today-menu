export type RecommendationMode = 'GUIDED' | 'PERSONALIZED_RANDOM';
export type RecommendationStatus = 'IN_PROGRESS' | 'COMPLETED';
export type SelectionType = 'SINGLE' | 'MULTIPLE' | 'NUMBER';
export type AnswerValue = string | number | boolean;

export type StartRecommendationRequest = {
  mode: RecommendationMode;
  locale?: string;
};

export type SubmitAnswerRequest = {
  sessionVersion: number;
  questionKey: string;
  selectedValues: AnswerValue[];
};

export type RecommendationContext = {
  contextVersion: number;
  category?: string;
  mealForm?: string;
  tastes?: string[];
  situation?: string;
  budgetMax?: number;
  constraints?: string[];
  location?: string;
  attributes?: string[];
};

export type QuestionOption = {
  value: AnswerValue;
  label: string;
  icon?: string;
  description?: string;
};

export type NextQuestion = {
  key: string;
  text: string;
  description?: string;
  selectionType: SelectionType;
  options?: QuestionOption[];
  input?: unknown;
};

export type RecommendationInProgress = {
  sessionId: string;
  mode: RecommendationMode;
  status: 'IN_PROGRESS';
  version: number;
  context: RecommendationContext;
  progress: {
    current: number;
    estimatedTotal: number;
  };
  nextQuestion: NextQuestion;
  createdAt: string;
  expiresAt: string;
};

export type RecommendationItem = {
  resultId: string;
  rank: number;
  food: {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
  };
  reason: string;
  matchedTags: Array<{
    key: string;
    label: string;
  }>;
  estimatedPrice?: number;
  matchScore: number;
};

export type RecommendationCompleted = {
  sessionId: string;
  mode: RecommendationMode;
  status: 'COMPLETED';
  version: number;
  context: RecommendationContext;
  recommendations: RecommendationItem[];
  completedAt: string;
};

export type RecommendationSession =
  | RecommendationInProgress
  | RecommendationCompleted;

export type FeedbackActionType =
  | 'VIEWED'
  | 'SELECTED'
  | 'SAVED'
  | 'DISLIKED'
  | 'DO_NOT_RECOMMEND';

export type RecommendationFeedbackRequest = {
  resultId: string;
  actionType: FeedbackActionType;
  rating?: number;
};

export type CreateMealLogRequest = {
  recommendationResultId?: string;
  foodId?: string;
  customFoodName?: string;
  rating: number;
  note?: string;
  photoIds?: string[];
  eatenAt?: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId: string;
  };
};
