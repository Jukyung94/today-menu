import type { Food, RecommendationContext } from '../recommendation/recommendation.types'

export const LLM_PROVIDER = Symbol('LLM_PROVIDER')

export interface LlmProvider {
  createReason(input: {
    food: Food
    context: RecommendationContext
    matchedLabels: string[]
  }): Promise<string | null>
}
