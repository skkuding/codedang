import type { Level } from '@prisma/client'
import { Exclude, Expose, Transform, Type } from 'class-transformer'
import { IsOptional } from 'class-validator'

export class RelatedProblemsResponseDto {
  data: Problem[]
  total: number
}

class Problem {
  order: number
  id: number
  title: string
  difficulty: Level
  submissionCount: number
  acceptedRate: number
  maxScore: number | null
  score: string | null
  submissionTime: Date | null
}

@Exclude()
// eslint-disable-next-line
export class _RelatedProblemsResponseDto {
  @Expose()
  @Type(() => _Problem)
  data: _Problem[]

  @Expose()
  total: number
}

@Exclude()
// eslint-disable-next-line
class _Problem {
  @Expose()
  order: number

  @Expose()
  @Transform(({ obj }) => obj.problem.id, { toClassOnly: true })
  id: number

  @Expose()
  @Transform(({ obj }) => obj.problem.title, { toClassOnly: true })
  title: number

  @Expose()
  @Transform(({ obj }) => obj.problem.difficulty, { toClassOnly: true })
  difficulty: Level

  @Expose()
  @Transform(({ obj }) => obj.problem.submissionCount, { toClassOnly: true })
  submissionCount: number

  @Expose()
  @Transform(({ obj }) => obj.problem.acceptedRate, { toClassOnly: true })
  acceptedRate: number

  @Expose()
  @IsOptional()
  maxScore: number | null

  @Expose()
  @IsOptional()
  score: string | null

  @Expose()
  @IsOptional()
  submissionTime: Date | null
}
