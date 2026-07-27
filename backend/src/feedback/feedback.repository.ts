import type { RecommendationFeedback } from './feedback.types'

export const FEEDBACK_REPOSITORY = Symbol('FEEDBACK_REPOSITORY')

export interface FeedbackRepository {
  save(feedback: RecommendationFeedback): Promise<void>
}
