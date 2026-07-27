import { IsEnum, IsLocale, IsOptional } from 'class-validator'
import { RecommendationMode } from '../../recommendation/recommendation.types'

export class StartRecommendationDto {
  @IsEnum(RecommendationMode)
  mode!: RecommendationMode

  @IsOptional()
  @IsLocale()
  locale?: string
}
