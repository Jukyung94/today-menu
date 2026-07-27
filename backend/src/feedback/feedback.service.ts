import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { RecommendationService } from '../recommendation/recommendation.service'
import type { CreateFeedbackDto } from './dto/create-feedback.dto'
import {
  FEEDBACK_REPOSITORY,
  type FeedbackRepository,
} from './feedback.repository'

@Injectable()
export class FeedbackService {
  constructor(
    @Inject(FEEDBACK_REPOSITORY)
    private readonly repository: FeedbackRepository,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(actorId: string, dto: CreateFeedbackDto) {
    const result = await this.recommendationService.findOwnedResult(
      dto.resultId,
      actorId,
    )
    if (!result) {
      throw new NotFoundException({
        code: 'RECOMMENDATION_RESULT_NOT_FOUND',
        message: 'The recommendation result was not found.',
      })
    }

    const feedback = {
      id: randomUUID(),
      actorId,
      resultId: dto.resultId,
      actionType: dto.actionType,
      ...(dto.rating === undefined ? {} : { rating: dto.rating }),
      createdAt: new Date().toISOString(),
    }
    await this.repository.save(feedback)
    return {
      feedbackId: feedback.id,
      resultId: feedback.resultId,
      actionType: feedback.actionType,
      ...(feedback.rating === undefined ? {} : { rating: feedback.rating }),
      createdAt: feedback.createdAt,
    }
  }
}
