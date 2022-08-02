import { ContestType } from '@prisma/client'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString
} from 'class-validator'

export class CreateContestDto {
  @IsNotEmpty()
  @IsInt()
  readonly group_id: number

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
