import { PartialType } from '@nestjs/graphql'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min
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
  invitationCode?: string
}

export class UpdateStudyDto extends PartialType(CreateStudyDto) {}
