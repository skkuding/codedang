import { Level, type Tag } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

@Exclude()
export class ProblemsResponseDto {
  @Expose()
  @Type(() => Problem)
  data: Problem[]

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
  engTitle: string

  @Expose()
  difficulty: Level

  @Expose()
  submissionCount: number

  @Expose()
  acceptedRate: number

  @Expose()
  tags: Partial<Tag>[]
}
