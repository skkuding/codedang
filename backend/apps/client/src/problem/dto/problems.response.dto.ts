import { Level, type Tag } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProblemsResponseDto {
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
