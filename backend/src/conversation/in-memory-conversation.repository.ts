import { Injectable } from '@nestjs/common'
import type { ConversationRepository } from './conversation.repository'
import type { RecommendationSession } from './conversation.types'

@Injectable()
export class InMemoryConversationRepository
  implements ConversationRepository
{
  private readonly sessions = new Map<string, RecommendationSession>()

  async create(session: RecommendationSession): Promise<void> {
    this.sessions.set(session.id, structuredClone(session))
  }

  async findById(sessionId: string): Promise<RecommendationSession | null> {
    const session = this.sessions.get(sessionId)
    return session ? structuredClone(session) : null
  }

  async saveIfVersion(
    session: RecommendationSession,
    expectedVersion: number,
  ): Promise<boolean> {
    const current = this.sessions.get(session.id)
    if (!current || current.version !== expectedVersion) {
      return false
    }
    this.sessions.set(session.id, structuredClone(session))
    return true
  }
}
