import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator'

export class CreateCourseNoticeCommentDto {
  @IsNotEmpty()
  @IsInt()
  courseNoticeId: number

  @IsNotEmpty()
  @IsString()
  content: string

  @IsOptional()
  @IsInt()
  replyOnId?: number
}

export class UpdateCourseNoticeCommentDto {
  @IsNotEmpty()
  @IsInt()
  commentId: number

  @IsNotEmpty()
  @IsString()
  content: string
}
