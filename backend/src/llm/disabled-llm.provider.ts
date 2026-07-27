import { Injectable } from '@nestjs/common'
import type { LlmProvider } from './llm.provider'

@Injectable()
export class DisabledLlmProvider implements LlmProvider {
  async createReason(): Promise<null> {
    return null
  }
}
