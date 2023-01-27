import { ContestType } from '@prisma/client'
import {
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsString
} from 'class-validator'

export class UpdateContestDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string

  @IsString()
  @IsNotEmpty()
  readonly description: string

  @IsString()
  @IsNotEmpty()
  readonly descriptionSummary: string

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
  readonly isRankisVisible: boolean

  @IsEnum(ContestType)
  @IsNotEmpty()
  readonly type: ContestType
}
