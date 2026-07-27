import { Module } from '@nestjs/common'
import { LlmModule } from '../llm/llm.module'
import { InMemoryRecommendationRepository } from './in-memory-recommendation.repository'
import { RECOMMENDATION_REPOSITORY } from './recommendation.repository'
import { RecommendationService } from './recommendation.service'

@Module({
  imports: [LlmModule],
  providers: [
    RecommendationService,
    {
      provide: RECOMMENDATION_REPOSITORY,
      useClass: InMemoryRecommendationRepository,
    },
  ],
  exports: [RecommendationService, RECOMMENDATION_REPOSITORY],
})
export class RecommendationModule {}
