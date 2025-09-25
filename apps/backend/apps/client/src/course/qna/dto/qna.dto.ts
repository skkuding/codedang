// apps/backend/apps/client/src/course/qna/dto/qna.dto.ts
import { CourseQnACategory } from '@prisma/client'
import { Transform } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean
} from 'class-validator'

export class CreateCourseQnADto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean
}

export class CreateCourseQnACommentDto {
  @IsString()
  @IsNotEmpty()
  content: string
}

export class GetCourseQnAsFilterDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  week?: number

  @IsArray()
  @IsOptional()
  @IsEnum(CourseQnACategory, { each: true })
  @Transform(({ value }) =>
    String(value)
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v)
  )
  categories?: CourseQnACategory[]

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    String(value)
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v))
  )
  problemIds?: number[]

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isAnswered?: boolean

  @IsOptional()
  @IsString()
  search?: string
}
