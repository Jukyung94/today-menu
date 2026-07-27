import { Module } from '@nestjs/common'
import { PreferenceModule } from '../preference/preference.module'
import { RecommendationModule } from '../recommendation/recommendation.module'
import { ConversationController } from './conversation.controller'
import { CONVERSATION_REPOSITORY } from './conversation.repository'
import { ConversationService } from './conversation.service'
import { InMemoryConversationRepository } from './in-memory-conversation.repository'

@Module({
  imports: [PreferenceModule, RecommendationModule],
  controllers: [ConversationController],
  providers: [
    ConversationService,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: InMemoryConversationRepository,
    },
  ],
  exports: [ConversationService, CONVERSATION_REPOSITORY],
})
export class ConversationModule {}
