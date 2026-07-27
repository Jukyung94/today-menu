import { Injectable } from '@nestjs/common'

export interface IdempotencyRecord {
  requestHash: string
  statusCode: number
  responseBody: unknown
}

@Injectable()
export class IdempotencyService {
  private readonly records = new Map<string, IdempotencyRecord>()

  get(key: string): IdempotencyRecord | undefined {
    return this.records.get(key)
  }

  save(key: string, record: IdempotencyRecord): void {
    this.records.set(key, structuredClone(record))
  }
}
