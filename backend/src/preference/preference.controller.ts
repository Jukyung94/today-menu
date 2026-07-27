import { Controller, Get } from '@nestjs/common'
import type { AuthenticatedActor } from '../auth/auth.types'
import { CurrentActor } from '../shared/http/current-actor.decorator'
import { PreferenceService } from './preference.service'

@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get('recommendation-eligibility')
  getRecommendationEligibility(@CurrentActor() actor: AuthenticatedActor) {
    return this.preferenceService.getRecommendationEligibility(actor.actorId)
  }
}
