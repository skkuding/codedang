import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested
} from 'class-validator'

export class GeneratorJudgeResultDto {
  @IsNumber()
  generatedTestCases!: number

  @IsNumber()
  totalTestCases!: number
}

export class GeneratorResultDto {
  @IsNumber()
  submissionId!: number

  @IsNumber()
  resultCode!: number

  @ValidateNested()
  @Type(() => GeneratorJudgeResultDto)
  judgeResult!: GeneratorJudgeResultDto

  @IsString()
  error!: string
}

export class ValidatorTestcaseResultDto {
  @IsNumber()
  id!: number

  @IsBoolean()
  isValid!: boolean
}

export class ValidatorJudgeResultDto {
  @IsBoolean()
  isValid!: boolean

  @IsNumber()
  testcaseCount!: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidatorTestcaseResultDto)
  results!: ValidatorTestcaseResultDto[]
}

export class ValidatorResultDto {
  @IsNumber()
  submissionId!: number

  @IsNumber()
  resultCode!: number

  @ValidateNested()
  @Type(() => ValidatorJudgeResultDto)
  judgeResult!: ValidatorJudgeResultDto

  @IsString()
  error!: string
}
