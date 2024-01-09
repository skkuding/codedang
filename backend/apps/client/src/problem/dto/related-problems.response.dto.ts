import { Level } from '@prisma/client'
import { Exclude, Expose, Transform } from 'class-transformer'

@Exclude()
export class RelatedProblemsResponseDto {
  @Expose()
  order: number

  @Expose()
  @Transform(({ obj }) => obj.problem.id, { toClassOnly: true })
  problemId: number

  @Expose()
  @Transform(({ obj }) => obj.problem.title, { toClassOnly: true })
  title: string

  @Expose()
  @Transform(({ obj }) => obj.problem.difficulty, { toClassOnly: true })
  difficulty: Level

  @Expose()
  @Transform(({ obj }) => obj.problem.submissionCount, { toClassOnly: true })
  submissionCount: number

  @Expose()
  @Transform(({ obj }) => obj.problem.acceptedRate, { toClassOnly: true })
  acceptedRate: number
}
