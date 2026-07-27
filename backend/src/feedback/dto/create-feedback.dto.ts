import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator'
import { FeedbackActionType } from '../feedback.types'

export class CreateFeedbackDto {
  @IsUUID()
  resultId!: string

  @IsEnum(FeedbackActionType)
  actionType!: FeedbackActionType

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number
}
