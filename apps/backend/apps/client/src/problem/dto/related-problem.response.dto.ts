import type { Problem } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import {
  _ProblemResponseDto,
  type ProblemResponseDto
} from './problem.response.dto'

export class RelatedProblemResponseDto {
  order: number
  problem: ProblemResponseDto
}

@Exclude()
// eslint-disable-next-line
export class _RelatedProblemResponseDto {
  @Expose()
  order: number

  @Expose()
  @Type(() => _ProblemResponseDto)
  problem: Problem
}
