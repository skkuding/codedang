import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsBoolean,
  IsInt,
  IsOptional
} from 'class-validator'

class Contact {
  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  office?: string

  @IsOptional()
  @IsString()
  phoneNum?: string
}

class Config {
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

export class CourseDto {
  @IsNotEmpty()
  @IsString()
  courseTitle: string

  @IsNotEmpty()
  @IsString()
  courseNum: string

  @IsOptional()
  @IsInt()
  class?: number

  @IsNotEmpty()
  @IsString()
  professor: string

  @IsNotEmpty()
  @IsString()
  semester: string

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Contact)
  contact: Contact

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Config)
  config: Config
}
