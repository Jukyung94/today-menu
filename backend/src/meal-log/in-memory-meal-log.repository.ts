import { Injectable } from '@nestjs/common'
import type { MealLogRepository } from './meal-log.repository'
import type { MealLog } from './meal-log.types'

@Injectable()
export class InMemoryMealLogRepository implements MealLogRepository {
  private readonly mealLogs = new Map<string, MealLog>()

  async save(mealLog: MealLog): Promise<void> {
    this.mealLogs.set(mealLog.id, structuredClone(mealLog))
  }

  async listByActor(actorId: string): Promise<MealLog[]> {
    return [...this.mealLogs.values()]
      .filter((mealLog) => mealLog.actorId === actorId)
      .sort((left, right) => right.eatenAt.localeCompare(left.eatenAt))
      .map((mealLog) => structuredClone(mealLog))
  }
}
