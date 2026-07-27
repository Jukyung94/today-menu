import { Injectable } from '@nestjs/common'
import { MealLogService } from '../meal-log/meal-log.service'

export const MINIMUM_HISTORY_DAYS = 7

@Injectable()
export class PreferenceService {
  constructor(private readonly mealLogService: MealLogService) {}

  async getRecommendationEligibility(actorId: string) {
    const recordedDays = await this.mealLogService.countRecordedDays(actorId)
    return {
      eligible: recordedDays >= MINIMUM_HISTORY_DAYS,
      minimumHistoryDays: MINIMUM_HISTORY_DAYS,
      recordedDays,
      remainingDays: Math.max(0, MINIMUM_HISTORY_DAYS - recordedDays),
    }
  }
}
