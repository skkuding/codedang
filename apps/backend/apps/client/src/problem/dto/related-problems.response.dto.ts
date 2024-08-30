import { Level } from '@prisma/client'
import { Exclude, Expose, Transform, Type } from 'class-transformer'
import { IsOptional } from 'class-validator'

@Exclude()
export class RelatedProblemsResponseDto {
  @Expose()
  @Type(() => Problem)
  data: Problem[]

  @Expose()
  total: number
}

@Exclude()
class Problem {
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
