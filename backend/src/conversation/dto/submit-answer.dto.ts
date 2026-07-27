import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
} from 'class-validator'

export class SubmitAnswerDto {
  @IsInt()
  @Min(1)
  sessionVersion!: number

  @IsString()
  questionKey!: string

  @IsArray()
  @ArrayMinSize(1)
  selectedValues!: Array<string | number | boolean>
}
