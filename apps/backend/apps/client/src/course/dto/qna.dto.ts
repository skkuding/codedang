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
  @Transform(({ value }) => (value ? Number(value) : undefined))
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
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  isAnswered?: boolean

  @IsOptional()
  @IsString()
  search?: string
}
