import { IsNotEmpty, IsBoolean, IsDateString, IsString } from 'class-validator'

export class UpdateContestDto {
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
