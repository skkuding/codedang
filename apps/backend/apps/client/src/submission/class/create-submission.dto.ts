import { Language } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
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
  locked: boolean
}

export class Template {
  language: Language
  code: Snippet[]
}

export class CreateSubmissionDto {
  @ValidateNested({ each: true })
  @Type(() => Snippet)
  code: Snippet[]

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language
}
