import type { RecommendationSession } from './conversation.types'

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY')

export interface ConversationRepository {
  create(session: RecommendationSession): Promise<void>
  findById(sessionId: string): Promise<RecommendationSession | null>
  saveIfVersion(
    session: RecommendationSession,
    expectedVersion: number,
  ): Promise<boolean>
}
