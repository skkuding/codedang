import { QnACategory } from '@prisma/client'
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

export class ContestQnACreateDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string
}

export class ContestQnACommentCreateDto {
  @IsString()
  @IsNotEmpty()
  content: string
}

export class GetContestQnAsFilter {
  @IsArray()
  @IsOptional()
  @IsEnum(QnACategory, { each: true })
  categories?: QnACategory[]

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  problemIds?: number[]

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderBy?: 'asc' | 'desc' = 'asc'
}
