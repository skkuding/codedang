import { QnACategory } from '@prisma/client'
import { Transform } from 'class-transformer'
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
  @Transform(
    ({ value }) => {
      if (value === undefined || value === null || value === '')
        return undefined
      const arr = Array.isArray(value) ? value : String(value).split(',')
      return arr.map((v) => String(v).trim()).filter((v) => v.length > 0)
    },
    { toClassOnly: true }
  )
  categories?: QnACategory[]

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(
    ({ value }) => {
      if (value === undefined || value === null || value === '')
        return undefined
      const arr = Array.isArray(value) ? value : String(value).split(',')
      return arr
        .map((v) => String(v).trim())
        .filter((v) => v.length > 0)
        .map((v) => Number(v))
    },
    { toClassOnly: true }
  )
  problemOrders?: number[]

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderBy?: 'asc' | 'desc' = 'asc'

  @IsOptional()
  search?: string
}
