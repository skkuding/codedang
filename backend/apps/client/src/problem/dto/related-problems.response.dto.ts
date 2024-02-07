import type { Level } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class RelatedProblemsResponseDto {
  @Expose()
  problems: {
    order: number
    problemId: number
    title: number
    difficulty: Level
    submissionCount: number
    acceptedRate: number
  }

  @Expose()
  total: number
}
