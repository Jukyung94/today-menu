import type { MealLog } from './meal-log.types'

export const MEAL_LOG_REPOSITORY = Symbol('MEAL_LOG_REPOSITORY')

export interface MealLogRepository {
  save(mealLog: MealLog): Promise<void>
  listByActor(actorId: string): Promise<MealLog[]>
}
