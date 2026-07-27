import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import type { AuthenticatedActor } from '../auth/auth.types'
import { CurrentActor } from '../shared/http/current-actor.decorator'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { FeedbackService } from './feedback.service'

@Controller('recommendation-feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentActor() actor: AuthenticatedActor,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.create(actor.actorId, dto)
  }
}
