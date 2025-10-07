import { OmitType } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean
} from 'class-validator'

export class CreateCourseNoticeCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string

  @IsOptional()
  @IsBoolean()
  isSecret = false

  @IsOptional()
  @IsInt()
  replyOnId?: number
}

export class UpdateCourseNoticeCommentDto extends OmitType(
  CreateCourseNoticeCommentDto,
  ['replyOnId']
) {}
