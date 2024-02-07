import type { Level, Tag } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProblemsResponseDto {
  @Expose() problems: {
    id: number
    title: string
    difficulty: Level
    submissionCount: number
    acceptedRate: number
    tags: Partial<Tag>[]
  }[]
  @Expose() total: number
}
