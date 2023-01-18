import { Problem } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import { ProblemResponseDto } from './problem.response.dto'

@Exclude()
export class RelatedProblemResponseDto {
  @Expose()
  displayId: string

  @Expose()
  @Type(() => ProblemResponseDto)
  problem: Problem
}
