import { ContestType } from '@prisma/client'
import {
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsString
} from 'class-validator'

export class UpdateContestDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string

  @IsNotEmpty()
  @IsString()
  readonly description: string

  @IsNotEmpty()
  @IsString()
  readonly description_summary: string

  @IsNotEmpty()
  @IsDateString()
  readonly start_time: Date

  @IsNotEmpty()
  @IsDateString()
  readonly end_time: Date

  @IsNotEmpty()
  @IsBoolean()
  readonly visible: boolean

  @IsNotEmpty()
  @IsBoolean()
  readonly is_rank_visible: boolean

  @IsNotEmpty()
  @IsEnum(ContestType)
  readonly type: ContestType
}
