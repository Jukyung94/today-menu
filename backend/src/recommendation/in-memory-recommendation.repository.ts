import { Injectable } from '@nestjs/common'
import type { RecommendationRepository } from './recommendation.repository'
import type { Food, RecommendationResult } from './recommendation.types'

const FOODS: Food[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: '제육덮밥',
    category: 'KOREAN',
    mealForm: 'RICE',
    tastes: ['SPICY', 'SAVORY'],
    situations: ['SOLO', 'HEARTY', 'QUICK'],
    attributes: ['WARM'],
    estimatedPrice: 10000,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: '김치찌개',
    category: 'KOREAN',
    mealForm: 'SOUP',
    tastes: ['SPICY', 'SAVORY'],
    situations: ['SOLO', 'HEARTY', 'GROUP'],
    attributes: ['WARM'],
    estimatedPrice: 9000,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: '냉모밀',
    category: 'JAPANESE',
    mealForm: 'NOODLE',
    tastes: ['REFRESHING', 'MILD'],
    situations: ['SOLO', 'QUICK'],
    attributes: ['COLD', 'LIGHT'],
    estimatedPrice: 9500,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: '마파두부 덮밥',
    category: 'CHINESE',
    mealForm: 'RICE',
    tastes: ['SPICY', 'SAVORY'],
    situations: ['SOLO', 'HEARTY'],
    attributes: ['WARM'],
    estimatedPrice: 11000,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: '토마토 파스타',
    category: 'WESTERN',
    mealForm: 'NOODLE',
    tastes: ['SAVORY', 'MILD'],
    situations: ['SOLO', 'GROUP'],
    attributes: ['WARM'],
    estimatedPrice: 14000,
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: '연어 샐러드',
    category: 'WESTERN',
    mealForm: 'LIGHT',
    tastes: ['REFRESHING', 'MILD'],
    situations: ['SOLO', 'QUICK'],
    attributes: ['COLD', 'LIGHT'],
    estimatedPrice: 13000,
  },
]

@Injectable()
export class InMemoryRecommendationRepository
  implements RecommendationRepository
{
  private readonly results = new Map<string, RecommendationResult>()

  async listFoods(): Promise<Food[]> {
    return structuredClone(FOODS)
  }

  async saveResults(results: RecommendationResult[]): Promise<void> {
    for (const result of results) {
      this.results.set(result.id, structuredClone(result))
    }
  }

  async findResultById(resultId: string): Promise<RecommendationResult | null> {
    const result = this.results.get(resultId)
    return result ? structuredClone(result) : null
  }
}
