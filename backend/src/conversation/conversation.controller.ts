import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import type { AuthenticatedActor } from '../auth/auth.types'
import { CurrentActor } from '../shared/http/current-actor.decorator'
import { ConversationService } from './conversation.service'
import { StartRecommendationDto } from './dto/start-recommendation.dto'
import { SubmitAnswerDto } from './dto/submit-answer.dto'

@Controller('recommendation-sessions')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  start(
    @CurrentActor() actor: AuthenticatedActor,
    @Body() dto: StartRecommendationDto,
  ) {
    return this.conversationService.start(actor.actorId, dto)
  }

  @Get(':sessionId')
  get(
    @CurrentActor() actor: AuthenticatedActor,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
  ) {
    return this.conversationService.get(actor.actorId, sessionId)
  }

  @Post(':sessionId/answers')
  @HttpCode(HttpStatus.OK)
  submitAnswer(
    @CurrentActor() actor: AuthenticatedActor,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.conversationService.submitAnswer(actor.actorId, sessionId, dto)
  }
}
