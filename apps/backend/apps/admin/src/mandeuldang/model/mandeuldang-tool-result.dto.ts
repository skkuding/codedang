import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'

export class GeneratorTestcaseErrorDto {
  @IsNumber()
  index!: number

  @IsString()
  message!: string

  @IsOptional()
  @IsString()
  stderr?: string
}

export class GeneratorToolResultDto {
  @IsNumber()
  generatedCount!: number

  @IsNumber()
  requestedCount!: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneratorTestcaseErrorDto)
  errors?: GeneratorTestcaseErrorDto[]

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  testcaseIds?: number[]
}

export class GeneratorResultDto {
  @IsString()
  messageId!: string

  @IsNumber()
  problemId!: number

  @IsString()
  toolType!: string

  @IsNumber()
  resultCode!: number

  @ValidateNested()
  @Type(() => GeneratorToolResultDto)
  toolResult!: GeneratorToolResultDto

  @IsString()
  error!: string
}

export class ValidatorTestcaseResultDto {
  @IsNumber()
  testcaseId!: number

  @IsBoolean()
  isValid!: boolean

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsString()
  stderr?: string
}

export class ValidatorToolResultDto {
  @IsBoolean()
  isAllValid!: boolean

  @IsNumber()
  testcaseCount!: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidatorTestcaseResultDto)
  results!: ValidatorTestcaseResultDto[]
}

export class ValidatorResultDto {
  @IsString()
  messageId!: string

  @IsNumber()
  problemId!: number

  @IsString()
  toolType!: string

  @IsNumber()
  resultCode!: number

  @ValidateNested()
  @Type(() => ValidatorToolResultDto)
  toolResult!: ValidatorToolResultDto

  @IsString()
  error!: string
}
