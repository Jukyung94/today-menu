import type { Food, RecommendationResult } from './recommendation.types'

export const RECOMMENDATION_REPOSITORY = Symbol('RECOMMENDATION_REPOSITORY')

export interface RecommendationRepository {
  listFoods(): Promise<Food[]>
  saveResults(results: RecommendationResult[]): Promise<void>
  findResultById(resultId: string): Promise<RecommendationResult | null>
}
