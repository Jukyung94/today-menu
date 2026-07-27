import { Test } from '@nestjs/testing'
import { DisabledLlmProvider } from '../src/llm/disabled-llm.provider'
import { LLM_PROVIDER } from '../src/llm/llm.provider'
import { LlmService } from '../src/llm/llm.service'
import { InMemoryRecommendationRepository } from '../src/recommendation/in-memory-recommendation.repository'
import { RECOMMENDATION_REPOSITORY } from '../src/recommendation/recommendation.repository'
import { RecommendationService } from '../src/recommendation/recommendation.service'

describe('RecommendationService', () => {
  it('returns rule-based recommendations when the LLM provider is disabled', async () => {
    const module = await Test.createTestingModule({
      providers: [
        RecommendationService,
        LlmService,
        {
          provide: RECOMMENDATION_REPOSITORY,
          useClass: InMemoryRecommendationRepository,
        },
        { provide: LLM_PROVIDER, useClass: DisabledLlmProvider },
      ],
    }).compile()
    const service = module.get(RecommendationService)

    const recommendations = await service.recommend({
      actorId: '20000000-0000-4000-8000-000000000001',
      sessionId: '30000000-0000-4000-8000-000000000001',
      context: {
        contextVersion: 5,
        category: 'KOREAN',
        mealForm: 'RICE',
        tastes: ['SPICY'],
        situation: 'HEARTY',
      },
    })

    expect(recommendations).toHaveLength(3)
    expect(recommendations[0].food.name).toBe('제육덮밥')
    expect(recommendations[0].reason).toContain('한식')
    expect(recommendations[0].matchScore).toBeGreaterThan(
      recommendations[1].matchScore,
    )
  })
})
