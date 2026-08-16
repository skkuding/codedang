import { PartialType } from '@nestjs/swagger'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
  Max,
  IsNumberString
} from 'class-validator'

export class CreateStudyDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  groupName: string

  @IsOptional()
  @IsString()
  description?: string

  @IsInt()
  @Min(1)
  capacity: number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  problemIds?: number[]

  @IsString()
  @IsOptional()
  @Length(6, 6)
  @IsNumberString()
  invitationCode?: string | null

  @IsInt()
  @Min(1)
  @Max(24)
  durationHours: number
}

export class UpdateStudyDto extends PartialType(CreateStudyDto) {}
