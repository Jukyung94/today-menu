import { ApiError, type ApiClient } from "./client";
import type {
  AuthSession,
  CreateMealLogInput,
  CreateRecommendationSessionInput,
  MealLog,
  MenuRecommendation,
  RecommendationContext,
  RecommendationEligibility,
  RecommendationQuestion,
  RecommendationSession,
  SubmitAnswerInput,
  Upload,
} from "./types";

const questions: RecommendationQuestion[] = [
  {
    key: "category",
    text: "어떤 종류가 당기세요?",
    description: "오늘의 기분에 가장 가까운 것을 골라주세요.",
    selectionType: "SINGLE",
    options: [
      { value: "한식", icon: "🍚", label: "한식" },
      { value: "중식", icon: "🥟", label: "중식" },
      { value: "양식", icon: "🍝", label: "양식" },
      { value: "일식", icon: "🍣", label: "일식" },
      { value: "ANY", label: "잘 모르겠어요", isFallback: true },
    ],
  },
  {
    key: "mealForm",
    text: "어떤 식사가 좋으세요?",
    description: "오늘은 어떤 한 끼를 원하시나요?",
    selectionType: "SINGLE",
    options: [
      { value: "밥", icon: "🍚", label: "밥" },
      { value: "면", icon: "🍜", label: "면" },
      { value: "국물", icon: "🥘", label: "국물" },
      { value: "가벼운 메뉴", icon: "🥗", label: "가벼운 메뉴" },
      { value: "ANY", label: "잘 모르겠어요", isFallback: true },
    ],
  },
  {
    key: "tastes",
    text: "오늘은 어떤 맛인가요?",
    description: "취향에 맞춰 다음 질문을 바꿔드릴게요.",
    selectionType: "SINGLE",
    options: [
      { value: "매콤한 맛", icon: "🌶️", label: "매콤한 맛" },
      { value: "담백한 맛", icon: "🫧", label: "담백한 맛" },
      { value: "시원한 맛", icon: "❄️", label: "시원한 맛" },
      { value: "ANY", icon: "✨", label: "상관없어요" },
      { value: "UNKNOWN", label: "잘 모르겠어요", isFallback: true },
    ],
  },
  {
    key: "situation",
    text: "어떤 상황인가요?",
    description: "마지막 질문이에요.",
    selectionType: "SINGLE",
    options: [
      { value: "혼자 먹어요", icon: "🙋", label: "혼자 먹어요" },
      { value: "든든하게", icon: "💪", label: "든든하게" },
      {
        value: "빨리 먹고 싶어요",
        icon: "⏱️",
        label: "빨리 먹고 싶어요",
      },
      { value: "여럿이 함께", icon: "👥", label: "여럿이 함께" },
      { value: "ANY", label: "잘 모르겠어요", isFallback: true },
    ],
  },
];

const recommendations: MenuRecommendation[] = [
  {
    resultId: "recommendation-1",
    rank: 1,
    food: { id: "menu-jeyuk", name: "제육덮밥", category: "한식" },
    reason: "매콤하고 든든한 한 끼가 필요한 오늘과 잘 맞아요.",
    matchedTags: ["한식", "밥", "매콤한 맛"].map((label) => ({
      key: label,
      label,
    })),
  },
  {
    resultId: "recommendation-2",
    rank: 2,
    food: { id: "menu-dakgalbi", name: "닭갈비 덮밥", category: "한식" },
    reason: "평소 취향은 살리되, 조금 다른 메뉴를 골라봤어요.",
    matchedTags: ["한식", "밥", "새로운 선택"].map((label) => ({
      key: label,
      label,
    })),
  },
  {
    resultId: "recommendation-3",
    rank: 3,
    food: { id: "menu-kimchi-stew", name: "김치찌개", category: "한식" },
    reason: "밥과 함께 편안하게 즐기기 좋은 든든한 메뉴예요.",
    matchedTags: ["한식", "국물", "따뜻한"].map((label) => ({
      key: label,
      label,
    })),
  },
];

const initialLogs: MealLog[] = [
  {
    id: "meal-log-1",
    menuId: "menu-jeyuk",
    menuName: "제육덮밥",
    menuEmoji: "🍛",
    rating: 5,
    note: "맛있어요",
    photoUrl: "mock://photo-1",
    eatenAt: new Date().toISOString(),
  },
  {
    id: "meal-log-2",
    menuName: "냉모밀",
    menuEmoji: "🍜",
    rating: 4,
    note: "괜찮아요",
    photoUrl: "mock://photo-2",
    eatenAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: "meal-log-3",
    menuName: "김치찌개",
    menuEmoji: "🥘",
    rating: 5,
    note: "맛있어요",
    eatenAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
  },
];

const sessions = new Map<string, RecommendationSession>();
let mealLogs = [...initialLogs];

function wait() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 180));
}

function createSession(
  input: CreateRecommendationSessionInput,
): RecommendationSession {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const common = {
    sessionId,
    version: 1,
    mode: input.mode,
    context: { contextVersion: 1 },
  };

  if (input.mode === "PERSONALIZED_RANDOM") {
    return {
      ...common,
      status: "COMPLETED",
      recommendations,
      completedAt: now.toISOString(),
    };
  }

  return {
    ...common,
    status: "IN_PROGRESS",
    progress: { current: 1, estimatedTotal: questions.length },
    nextQuestion: questions[0],
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
  };
}

function updateContext(
  context: RecommendationContext,
  questionKey: string,
  value: string | number | boolean,
) {
  const next = {
    ...context,
    contextVersion: context.contextVersion + 1,
  };
  const normalized = String(value);
  if (questionKey === "category") next.category = normalized;
  if (questionKey === "mealForm") next.mealForm = normalized;
  if (questionKey === "tastes") next.tastes = [normalized];
  if (questionKey === "situation") next.situation = normalized;
  return next;
}

export class MockApiClient implements ApiClient {
  async authenticateGuest(): Promise<AuthSession> {
    await wait();
    return {
      accessToken: `mock-${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    };
  }

  async createRecommendationSession(
    input: CreateRecommendationSessionInput,
  ) {
    await wait();
    const session = createSession(input);
    sessions.set(session.sessionId, session);
    return session;
  }

  async getRecommendationSession(sessionId: string) {
    await wait();
    const session = sessions.get(sessionId);
    if (!session) {
      throw new ApiError("추천 세션이 만료되었습니다.", "SESSION_EXPIRED", 404);
    }
    return session;
  }

  async submitAnswer(sessionId: string, input: SubmitAnswerInput) {
    await wait();
    const session = sessions.get(sessionId);
    if (!session) {
      throw new ApiError("추천 세션이 만료되었습니다.", "SESSION_EXPIRED", 404);
    }
    if (session.version !== input.sessionVersion) {
      throw new ApiError(
        "다른 화면에서 답변이 변경되었습니다.",
        "SESSION_VERSION_CONFLICT",
        409,
      );
    }
    if (
      session.status !== "IN_PROGRESS" ||
      session.nextQuestion.key !== input.questionKey
    ) {
      throw new ApiError(
        "현재 질문과 답변이 맞지 않습니다.",
        "VALIDATION_ERROR",
        422,
      );
    }

    const selectedValue = input.selectedValues[0];
    const option = session.nextQuestion.options?.find(
      ({ value }) => value === selectedValue,
    );
    if (!option) {
      throw new ApiError(
        "선택지를 찾을 수 없습니다.",
        "VALIDATION_ERROR",
        422,
      );
    }

    const context = updateContext(
      session.context,
      input.questionKey,
      option.value,
    );
    const nextQuestion = questions[session.progress.current] ?? null;
    const next: RecommendationSession = nextQuestion
      ? {
          ...session,
          version: session.version + 1,
          context,
          progress: {
            current: session.progress.current + 1,
            estimatedTotal: questions.length,
          },
          nextQuestion,
        }
      : {
          sessionId: session.sessionId,
          mode: session.mode,
          status: "COMPLETED",
          version: session.version + 1,
          context,
          recommendations,
          completedAt: new Date().toISOString(),
        };
    sessions.set(sessionId, next);
    return next;
  }

  async submitFeedback() {
    await wait();
  }

  async upload(): Promise<Upload> {
    await wait();
    return { id: crypto.randomUUID(), url: "mock://uploaded-photo" };
  }

  async createMealLog(input: CreateMealLogInput) {
    await wait();
    const recommendation = recommendations.find(
      ({ resultId }) => resultId === input.recommendationResultId,
    );
    const mealLog: MealLog = {
      id: crypto.randomUUID(),
      menuId: input.foodId,
      menuName:
        input.customFoodName ?? recommendation?.food.name ?? "선택한 메뉴",
      menuEmoji: recommendation
        ? recommendation.food.name.includes("찌개")
          ? "🥘"
          : "🍛"
        : undefined,
      rating: input.rating,
      note: input.note,
      photoUrl: input.photoIds?.length ? "mock://uploaded-photo" : undefined,
      eatenAt: input.eatenAt ?? new Date().toISOString(),
    };
    mealLogs = [mealLog, ...mealLogs];
    return mealLog;
  }

  async listMealLogs() {
    await wait();
    return mealLogs;
  }

  async getRecommendationEligibility(): Promise<RecommendationEligibility> {
    await wait();
    return { eligible: true, recordedDays: 12, requiredDays: 7 };
  }
}
