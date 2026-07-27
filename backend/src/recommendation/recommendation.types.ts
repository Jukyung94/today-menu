export enum RecommendationMode {
  GUIDED = 'GUIDED',
  PERSONALIZED_RANDOM = 'PERSONALIZED_RANDOM',
}

export interface RecommendationContext {
  contextVersion: number
  category?: string
  mealForm?: string
  tastes?: string[]
  situation?: string
  budgetMax?: number
  constraints?: string[]
  location?: string
  attributes?: Record<string, string | number | boolean>
}

export interface Food {
  id: string
  name: string
  category: string
  mealForm: string
  tastes: string[]
  situations: string[]
  attributes: string[]
  estimatedPrice: number
  imageUrl?: string
}

export interface RecommendationResult {
  id: string
  actorId: string
  sessionId: string
  foodId: string
  rank: number
  reason: string
  matchedTags: Array<{ key: string; label: string }>
  matchScore: number
  createdAt: string
}

export interface RecommendationItem {
  resultId: string
  rank: number
  food: {
    id: string
    name: string
    category: string
    imageUrl?: string
  }
  reason: string
  matchedTags: Array<{ key: string; label: string }>
  estimatedPrice?: number
  matchScore: number
}
