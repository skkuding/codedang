import type {
  Language,
  Level,
  ProblemTestcase,
  Tag,
  UpdateHistory
} from '@prisma/client'
import type { JsonValue } from '@prisma/client/runtime/library'
import { Exclude, Expose } from 'class-transformer'

export class ProblemResponseDto {
  id: number
  title: string
  // 만들당 Draft/Ready 문제는 이 필드들이 아직 채워지지 않을 수 있다(nullable).
  // 이 DTO는 status=Published 문제만 반환하는 getProblem()에서 쓰이므로, 정상적으로는
  // 항상 값이 채워져 있어야 한다 — 다만 스키마 자체는 nullable이라 타입도 그에 맞춘다.
  description: string | null
  inputDescription: string | null
  outputDescription: string | null
  hint: string | null
  engTitle: string | null
  engDescription: string | null
  engInputDescription: string | null
  engOutputDescription: string | null
  engHint: string | null
  languages: Language[]
  timeLimit: number | null
  memoryLimit: number | null
  difficulty: Level | null
  source: string | null
  submissionCount: number
  acceptedCount: number
  acceptedRate: number
  isHiddenUploadedByZip: boolean
  isSampleUploadedByZip: boolean
  tags: Partial<Tag>[]
  template: JsonValue[]
  problemTestcase: Pick<ProblemTestcase, 'id' | 'input' | 'output'>[]
  updateHistory: UpdateHistory[]
}

/**
 * @deprecated _가 없는 것으로 사용해주세요
 */
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
  @Expose() updateContentTime: Date
  @Expose() isHiddenUploadedByZip: boolean
  @Expose() isSampleUploadedByZip: boolean
}
