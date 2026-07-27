import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateMealLogDto {
  @IsOptional()
  @IsUUID()
  recommendationResultId?: string

  @IsOptional()
  @IsUUID()
  foodId?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customFoodName?: string

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  photoIds?: string[]

  @IsOptional()
  @IsDateString()
  eatenAt?: string
}
