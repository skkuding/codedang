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

  @IsNotEmpty()
  @IsBoolean()
  isVisible: boolean

  @IsOptional()
  @IsInt()
  replyOnId?: number
}

export class UpdateCourseNoticeCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string
}
