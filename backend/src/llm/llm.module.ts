import { Module } from '@nestjs/common'
import { DisabledLlmProvider } from './disabled-llm.provider'
import { LLM_PROVIDER } from './llm.provider'
import { LlmService } from './llm.service'

@Module({
  providers: [
    LlmService,
    { provide: LLM_PROVIDER, useClass: DisabledLlmProvider },
  ],
  exports: [LlmService],
})
export class LlmModule {}
