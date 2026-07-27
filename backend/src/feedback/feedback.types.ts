export enum FeedbackActionType {
  VIEWED = 'VIEWED',
  SELECTED = 'SELECTED',
  SAVED = 'SAVED',
  DISLIKED = 'DISLIKED',
  DO_NOT_RECOMMEND = 'DO_NOT_RECOMMEND',
}

export interface RecommendationFeedback {
  id: string
  actorId: string
  resultId: string
  actionType: FeedbackActionType
  rating?: number
  createdAt: string
}
