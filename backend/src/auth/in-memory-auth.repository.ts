import { Injectable } from '@nestjs/common'
import type { AuthRepository } from './auth.repository'
import type { AccessTokenRecord } from './auth.types'

@Injectable()
export class InMemoryAuthRepository implements AuthRepository {
  private readonly records = new Map<string, AccessTokenRecord>()

  async save(record: AccessTokenRecord): Promise<void> {
    this.records.set(record.accessToken, structuredClone(record))
  }

  async findByAccessToken(accessToken: string): Promise<AccessTokenRecord | null> {
    const record = this.records.get(accessToken)
    return record ? structuredClone(record) : null
  }
}
