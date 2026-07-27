import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { AUTH_REPOSITORY, type AuthRepository } from './auth.repository'
import { ActorType, type AuthenticatedActor } from './auth.types'

const GUEST_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly repository: AuthRepository,
  ) {}

  async createGuest(): Promise<{
    accessToken: string
    tokenType: 'BEARER'
    expiresAt: string
    actor: { id: string; type: ActorType }
  }> {
    const actorId = randomUUID()
    const accessToken = randomUUID()
    const expiresAt = new Date(Date.now() + GUEST_TOKEN_TTL_MS).toISOString()

    await this.repository.save({
      actorId,
      actorType: ActorType.GUEST,
      accessToken,
      expiresAt,
    })

    return {
      accessToken,
      tokenType: 'BEARER',
      expiresAt,
      actor: { id: actorId, type: ActorType.GUEST },
    }
  }

  async authenticate(accessToken: string): Promise<AuthenticatedActor> {
    const record = await this.repository.findByAccessToken(accessToken)
    if (!record || new Date(record.expiresAt).getTime() <= Date.now()) {
      throw new UnauthorizedException({
        code: 'INVALID_ACCESS_TOKEN',
        message: 'The access token is invalid or expired.',
      })
    }

    return { actorId: record.actorId, actorType: record.actorType }
  }
}
