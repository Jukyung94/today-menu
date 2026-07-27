import type {
  RecommendationContext,
  RecommendationItem,
  RecommendationMode,
} from '../recommendation/recommendation.types'

export enum ConversationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type SelectedValue = string | number | boolean

export interface SessionAnswer {
  questionKey: string
  selectedValues: SelectedValue[]
  answeredAt: string
}

export interface RecommendationSession {
  id: string
  actorId: string
  mode: RecommendationMode
  locale?: string
  status: ConversationStatus
  version: number
  context: RecommendationContext
  answers: SessionAnswer[]
  recommendations?: RecommendationItem[]
  createdAt: string
  expiresAt: string
  completedAt?: string
}

export interface RecommendationQuestion {
  key: string
  text: string
  description?: string
  selectionType: 'SINGLE' | 'MULTIPLE' | 'NUMBER'
  options?: Array<{
    value: string | number | boolean
    label: string
    icon?: string
    description?: string
  }>
  input?: {
    min?: number
    max?: number
    unit?: string
  }
}
