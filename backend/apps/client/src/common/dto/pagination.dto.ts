import { Exclude, Expose, Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'
import {
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_OFFSET
} from '../constants'

@Exclude()
export class PaginationDto {
  // TODO: 너무 많거나 없는 경우
  // default 값으로 수정하는 로직이 포함되어야 함

  @Expose()
  @Min(PAGINATION_MIN_OFFSET)
  @IsInt()
  @Type(() => Number)
  offset: number

  @Expose()
  @Max(PAGINATION_MAX_LIMIT)
  @Min(PAGINATION_MIN_LIMIT)
  @IsInt()
  @Type(() => Number)
  limit: number
}
