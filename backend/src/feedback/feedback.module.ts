import { Module } from '@nestjs/common'
import { RecommendationModule } from '../recommendation/recommendation.module'
import { FeedbackController } from './feedback.controller'
import { FEEDBACK_REPOSITORY } from './feedback.repository'
import { FeedbackService } from './feedback.service'
import { InMemoryFeedbackRepository } from './in-memory-feedback.repository'

@Module({
  imports: [RecommendationModule],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    {
      provide: FEEDBACK_REPOSITORY,
      useClass: InMemoryFeedbackRepository,
    },
  ],
})
export class FeedbackModule {}
