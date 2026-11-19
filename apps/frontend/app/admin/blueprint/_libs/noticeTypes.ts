import type { BlueprintCreateSection } from './createTypes'
import type { BlueprintReadResult } from './types'

export type BlueprintNoticeSection = BlueprintCreateSection

export interface BlueprintNoticeScope {
  kind: 'notice'
  blueprintCourseId: number
  cursor: number | null
  take: number
  page: number
}

export interface BlueprintNoticeSummary {
  id: number
  title: string
  createdAt: string | null
}

export interface BlueprintNoticePage {
  items: readonly BlueprintNoticeSummary[]
  previousCursor?: number | null
  hasNextPage: boolean
  nextCursor: number | null
}

export interface BlueprintNoticeDraft {
  title: string
  content: string
  sectionGroupIds: readonly number[]
}

export interface BlueprintNoticeOptions {
  sections: readonly BlueprintNoticeSection[]
}

export interface BlueprintNoticeEditData extends BlueprintNoticeOptions {
  blueprintCourseId: number
  noticeId: number
  values: BlueprintNoticeDraft
}

export interface BlueprintNoticeSource {
  readNotices: (
    scope: BlueprintNoticeScope
  ) => Promise<BlueprintReadResult<BlueprintNoticePage>>
  readOptions: (
    blueprintId: number
  ) => Promise<BlueprintReadResult<BlueprintNoticeOptions>>
  readNotice: (
    blueprintId: number,
    noticeId: number
  ) => Promise<BlueprintReadResult<BlueprintNoticeEditData>>
}
