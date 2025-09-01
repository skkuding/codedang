import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator'

export class CreateCourseNoticeCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string

  @IsOptional()
  @IsInt()
  replyOnId?: number
}

export class UpdateCourseNoticeCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string
}
