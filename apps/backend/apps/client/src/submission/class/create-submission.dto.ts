import { Language } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'

export class Template {
  @IsEnum(Language)
  language: Language

  @IsString()
  initialCode: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Range)
  readOnlyRanges: Range[]
}

export class Range {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  from: number

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  to: number
}

export class CreateSubmissionDto {
  @IsString()
  code: string

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Range)
  readOnlyRanges: Range[] // User Code에서의 readOnlyRanges
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
