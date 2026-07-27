export interface MealLog {
  id: string
  actorId: string
  recommendationResultId?: string
  foodId?: string
  customFoodName?: string
  rating: number
  note?: string
  photoIds: string[]
  eatenAt: string
  createdAt: string
}
