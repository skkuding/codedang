import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'

class StudyConfig {
  @IsBoolean()
  @IsNotEmpty()
  showOnList: boolean

  @IsBoolean()
  @IsNotEmpty()
  allowJoinFromSearch: boolean

  @IsBoolean()
  @IsNotEmpty()
  allowJoinWithURL: boolean

  @IsBoolean()
  @IsNotEmpty()
  requireApprovalBeforeJoin: boolean
}

export class CreateStudyDto {
  @IsNotEmpty()
  @IsString()
  groupName: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StudyConfig)
  config: StudyConfig
}

export class UpdateStudyDto {
  @IsOptional()
  @IsString()
  groupName?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @ValidateNested()
  @Type(() => StudyConfig)
  config?: StudyConfig
}

export class UpsertDraftDto {
  @IsNotEmpty()
  code: object
}
