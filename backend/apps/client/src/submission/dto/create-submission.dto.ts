import { Language } from '@prisma/client'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

export class CreateSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  problemId: number

  @IsString()
  @IsNotEmpty()
  code: string

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language

  @IsNumber()
  @IsOptional()
  contestId?: number

  @IsNumber()
  @IsOptional()
  workbookId?: number
}
