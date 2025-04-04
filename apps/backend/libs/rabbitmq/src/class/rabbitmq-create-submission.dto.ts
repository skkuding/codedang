import { Language } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
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

export class CreateUserTestSubmissionDto extends CreateSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTestcase)
  userTestcases: UserTestcase[]
}

export class UserTestcase {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  in: string

  @IsString()
  @IsNotEmpty()
  out: string
}
