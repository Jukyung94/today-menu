import { Inject, Injectable } from '@nestjs/common'
import type { Food, RecommendationContext } from '../recommendation/recommendation.types'
import { LLM_PROVIDER, type LlmProvider } from './llm.provider'

@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly provider: LlmProvider,
  ) {}

  async createReasonWithFallback(input: {
    food: Food
    context: RecommendationContext
    matchedLabels: string[]
  }): Promise<string> {
    try {
      const generated = await this.provider.createReason(input)
      if (generated?.trim()) {
        return generated.trim()
      }
    } catch {
      // LLM failures must never block rule-based recommendations.
    }

    if (input.matchedLabels.length > 0) {
      return `${input.matchedLabels.join(', ')} 조건과 잘 맞는 메뉴예요.`
    }
    return '다양하게 즐길 수 있는 오늘의 메뉴로 골랐어요.'
  }
}
