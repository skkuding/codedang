import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator'
import { Language } from '@prisma/client'

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

  @IsBoolean()
  @IsNotEmpty()
  shared: boolean
}
