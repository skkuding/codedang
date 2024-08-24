import {
  type Language,
  Level,
  type ProblemTestcase,
  type Tag
} from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProblemResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() description: string
  @Expose() inputDescription: string
  @Expose() outputDescription: string
  @Expose() hint: string
  @Expose() engTitle: string
  @Expose() engDescription: string
  @Expose() engInputDescription: string
  @Expose() engOutputDescription: string
  @Expose() engHint: string
  @Expose() languages: Language[]
  @Expose() timeLimit: number
  @Expose() memoryLimit: number
  @Expose() difficulty: Level
  @Expose() source: string[]
  @Expose() submissionCount: number
  @Expose() acceptedCount: number
  @Expose() acceptedRate: number
  @Expose() tags: Partial<Tag>[]
  @Expose() template: JSON[]
  @Expose() testcases: Pick<ProblemTestcase, 'id' | 'input' | 'output'>[]
}
