import type { Dispatch, SetStateAction } from 'react'

export interface BlueprintAssignmentCopy {
  id: number | null
  groupId: number | null
  sectionLabel: string
  startTime: string | null
  dueTime: string | null
  endTime: string | null
}

export interface BlueprintAssignmentSummary {
  id: number
  title: string
  week: number
  isExercise: boolean
  assignment: readonly BlueprintAssignmentCopy[] | null
}

export interface BlueprintAssignmentProblem {
  problemId: number
  title: string
  order: number
  score: number
}

export interface BlueprintAssignmentDetail extends BlueprintAssignmentSummary {
  description: string
  blueprintAssignmentProblem: readonly BlueprintAssignmentProblem[] | null
  isVisible: boolean | null
  isRankVisible: boolean | null
  isJudgeResultVisible: boolean | null
  enableCopyPaste: boolean | null
  autoFinalizeScore: boolean | null
}

export type BlueprintReadState<T> =
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void }
  | { status: 'forbidden' }
  | { status: 'not-found' }
  | { status: 'success'; data: T }

export interface BlueprintListScope {
  blueprintCourseId: number
  isExercise: boolean
  cursor: number | null
  take: number
  page?: number
}

export interface BlueprintListViewState {
  search: string
  selectedIds: readonly number[]
  expandedIds: readonly number[]
}

export interface BlueprintListStateController {
  value: BlueprintListViewState
  onChange: Dispatch<SetStateAction<BlueprintListViewState>>
}

export interface BlueprintCourseInformation {
  title: string
  courseCode?: string | null
  semester?: string | null
}

export interface BlueprintAssignmentPage {
  items: readonly BlueprintAssignmentSummary[]
  previousCursor?: number | null
  nextCursor: number | null
}

export type BlueprintReadResult<T> =
  | { status: 'success'; data: T }
  | { status: 'forbidden' }
  | { status: 'not-found' }

export interface BlueprintDataSource {
  readCourse: (
    blueprintId: number
  ) => Promise<BlueprintReadResult<BlueprintCourseInformation>>
  readAssignments: (
    scope: BlueprintListScope
  ) => Promise<BlueprintReadResult<BlueprintAssignmentPage>>
  readAssignment: (
    blueprintId: number,
    assignmentId: number
  ) => Promise<BlueprintReadResult<BlueprintAssignmentDetail>>
}
