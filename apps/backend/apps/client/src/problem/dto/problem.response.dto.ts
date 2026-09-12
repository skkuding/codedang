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
  // 이 DTO는 status=Published 문제만 반환하는 getProblem()에서만 쓰인다.
  // 스키마상 nullable이지만 발행된 문제라면 아래 필드가 항상 채워져 있으므로
  // (getProblem에서 assertPublishedProblemContent로 보장) 기존 non-null 계약을 유지한다.
  // 발행 전(Draft/Ready) 만들당 문제는 이 DTO가 아니라 만들당 전용 조회 API로 다룬다.
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
