import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { LlmService } from '../llm/llm.service'
import {
  RECOMMENDATION_REPOSITORY,
  type RecommendationRepository,
} from './recommendation.repository'
import type {
  Food,
  RecommendationContext,
  RecommendationItem,
  RecommendationResult,
} from './recommendation.types'

const LABELS: Record<string, string> = {
  KOREAN: '한식',
  CHINESE: '중식',
  WESTERN: '양식',
  JAPANESE: '일식',
  RICE: '밥',
  NOODLE: '면',
  SOUP: '국물',
  LIGHT: '가벼운 메뉴',
  SPICY: '매콤한 맛',
  MILD: '담백한 맛',
  REFRESHING: '시원한 맛',
  SOLO: '혼자 먹기',
  HEARTY: '든든한 식사',
  QUICK: '빠른 식사',
  GROUP: '여럿이 함께',
}

interface ScoredFood {
  food: Food
  score: number
  matchedKeys: string[]
}

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(RECOMMENDATION_REPOSITORY)
    private readonly repository: RecommendationRepository,
    private readonly llmService: LlmService,
  ) {}

  async recommend(input: {
    actorId: string
    sessionId: string
    context: RecommendationContext
  }): Promise<RecommendationItem[]> {
    const foods = await this.repository.listFoods()
    const scored = foods
      .map((food) => this.score(food, input.context))
      .sort(
        (left, right) =>
          right.score - left.score || left.food.name.localeCompare(right.food.name),
      )
      .slice(0, 3)

    const createdAt = new Date().toISOString()
    const persisted: RecommendationResult[] = []
    const items: RecommendationItem[] = []

    for (const [index, candidate] of scored.entries()) {
      const matchedTags = candidate.matchedKeys.map((key) => ({
        key,
        label: LABELS[key] ?? key,
      }))
      const reason = await this.llmService.createReasonWithFallback({
        food: candidate.food,
        context: input.context,
        matchedLabels: matchedTags.map((tag) => tag.label),
      })
      const resultId = randomUUID()
      const rank = index + 1
      const matchScore = Math.min(100, 50 + candidate.score * 5)

      persisted.push({
        id: resultId,
        actorId: input.actorId,
        sessionId: input.sessionId,
        foodId: candidate.food.id,
        rank,
        reason,
        matchedTags,
        matchScore,
        createdAt,
      })
      items.push({
        resultId,
        rank,
        food: {
          id: candidate.food.id,
          name: candidate.food.name,
          category: candidate.food.category,
          ...(candidate.food.imageUrl
            ? { imageUrl: candidate.food.imageUrl }
            : {}),
        },
        reason,
        matchedTags,
        estimatedPrice: candidate.food.estimatedPrice,
        matchScore,
      })
    }

    await this.repository.saveResults(persisted)
    return items
  }

  async findOwnedResult(resultId: string, actorId: string) {
    const result = await this.repository.findResultById(resultId)
    return result?.actorId === actorId ? result : null
  }

  private score(food: Food, context: RecommendationContext): ScoredFood {
    const matchedKeys: string[] = []
    let score = 0

    if (context.category && context.category !== 'ANY' && food.category === context.category) {
      score += 3
      matchedKeys.push(context.category)
    }
    if (context.mealForm && context.mealForm !== 'ANY' && food.mealForm === context.mealForm) {
      score += 3
      matchedKeys.push(context.mealForm)
    }
    for (const taste of context.tastes ?? []) {
      if (taste !== 'ANY' && food.tastes.includes(taste)) {
        score += 2
        matchedKeys.push(taste)
      }
    }
    if (
      context.situation &&
      context.situation !== 'ANY' &&
      food.situations.includes(context.situation)
    ) {
      score += 2
      matchedKeys.push(context.situation)
    }
    if (context.budgetMax !== undefined && food.estimatedPrice <= context.budgetMax) {
      score += 1
    }
    if (
      (context.constraints ?? []).some((constraint) =>
        food.attributes.includes(constraint),
      )
    ) {
      score -= 4
    }

    return { food, score, matchedKeys: [...new Set(matchedKeys)] }
  }
}
