import type { Language, Level, Tag } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

export class ProblemsResponseDto {
  data: Problem[]
  total: number
}

class Problem {
  id: number
  title: string
  engTitle: string | null
  // 목록도 status=Published 문제만 반환하므로 기존 non-null 계약을 유지한다.
  difficulty: Level
  submissionCount: number
  acceptedRate: number
  tags: Partial<Tag>[]
  languages: Language[]
  hasPassed: boolean | null
}

/**
 * @deprecated _가 없는 것으로 사용해주세요
 */
@Exclude()
// eslint-disable-next-line
export class _ProblemsResponseDto {
  @Expose()
  @Type(() => _Problem)
  data: _Problem[]

  @Expose()
  total: number
}

/**
 * @deprecated _가 없는 것으로 사용해주세요
 */
@Exclude()
// eslint-disable-next-line
class _Problem {
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

  @Expose()
  languages: Language[]

  @Expose()
  hasPassed: boolean | null
}
