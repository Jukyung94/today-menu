import type { AccessTokenRecord } from './auth.types'

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY')

export interface AuthRepository {
  save(record: AccessTokenRecord): Promise<void>
  findByAccessToken(accessToken: string): Promise<AccessTokenRecord | null>
}
