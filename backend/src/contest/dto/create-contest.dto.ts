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
  @IsInt()
  @IsNotEmpty()
  readonly group_id: number

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
