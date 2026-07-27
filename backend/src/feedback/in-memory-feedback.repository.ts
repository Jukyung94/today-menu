import { Injectable } from '@nestjs/common'
import type { FeedbackRepository } from './feedback.repository'
import type { RecommendationFeedback } from './feedback.types'

@Injectable()
export class InMemoryFeedbackRepository implements FeedbackRepository {
  private readonly feedback = new Map<string, RecommendationFeedback>()

  async save(feedback: RecommendationFeedback): Promise<void> {
    this.feedback.set(feedback.id, structuredClone(feedback))
  }
}
