import { Language } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested
} from 'class-validator'

export class Snippet {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsString()
  @IsNotEmpty()
  text: string

  @IsBoolean()
  @IsNotEmpty()
  readonly: boolean
}

export class Template {
  language: Language
  code: Snippet[]
}

export class CreateSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  problemId: number

  @ValidateNested({ each: true })
  @Type(() => Snippet)
  code: Snippet[]

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language

  @IsEmpty()
  contestId?: number

  @IsEmpty()
  workbookId?: number
}
