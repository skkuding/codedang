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
  readonly description_summary: string

  @IsDateString()
  @IsNotEmpty()
  readonly start_time: Date

  @IsDateString()
  @IsNotEmpty()
  readonly end_time: Date

  @IsBoolean()
  @IsNotEmpty()
  readonly visible: boolean

  @IsBoolean()
  @IsNotEmpty()
  readonly is_rank_visible: boolean

  @IsEnum(ContestType)
  @IsNotEmpty()
  readonly type: ContestType
}
