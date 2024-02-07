import { Level, type Tag } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

@Exclude()
export class ProblemsResponseDto {
  @Expose()
  @Type(() => Problem)
  problems: Problem[]

  @Expose()
  total: number
}

@Exclude()
class Problem {
  @Expose()
  id: number

  @Expose()
  title: string

  @Expose()
  difficulty: Level

  @Expose()
  submissionCount: number

  @Expose()
  acceptedRate: number

  @Expose()
  tags: Partial<Tag>[]
}
