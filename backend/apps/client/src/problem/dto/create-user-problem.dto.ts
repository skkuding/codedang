import { Language } from '@generated'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateNested
} from 'class-validator'

class Snippet {
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

class Template {
  @IsEnum(Language)
  language: Language

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Snippet)
  code: Snippet[]
}

export class CreateTemplateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Template)
  template: Template[]
}
