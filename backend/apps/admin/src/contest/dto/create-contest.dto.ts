import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString
} from 'class-validator'

export class CreateContestDto {
  @IsInt()
  @IsNotEmpty()
  readonly groupId: number

  @IsString()
  @IsNotEmpty()
  readonly title: string

  @IsString()
  @IsNotEmpty()
  readonly description: string

  @IsDateString()
  @IsNotEmpty()
  readonly startTime: Date

  @IsDateString()
  @IsNotEmpty()
  readonly endTime: Date

  @IsBoolean()
  @IsNotEmpty()
  readonly isVisible: boolean

  @IsBoolean()
  @IsNotEmpty()
  readonly isRankVisible: boolean
}
