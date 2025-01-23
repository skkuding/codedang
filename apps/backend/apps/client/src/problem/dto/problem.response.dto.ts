import type { Language, Level, ProblemTestcase, Tag } from '@prisma/client'
import type { JsonValue } from '@prisma/client/runtime/library'
import { Exclude, Expose } from 'class-transformer'

export class ProblemResponseDto {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  hint: string
  engTitle: string | null
  engDescription: string | null
  engInputDescription: string | null
  engOutputDescription: string | null
  engHint: string | null
  languages: Language[]
  timeLimit: number
  memoryLimit: number
  difficulty: Level
  source: string
  submissionCount: number
  acceptedCount: number
  acceptedRate: number
  tags: Partial<Tag>[]
  template: JsonValue[]
  problemTestcase: Pick<ProblemTestcase, 'id' | 'input' | 'output'>[]
}

@Exclude()
// eslint-disable-next-line
export class _ProblemResponseDto {
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
  @Expose() problemTestcase: Pick<ProblemTestcase, 'id' | 'input' | 'output'>[]
}
