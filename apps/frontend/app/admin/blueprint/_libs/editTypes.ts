import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions,
  BlueprintCreateProblem
} from './createTypes'
import { parseBlueprintScheduleDateTime } from './createValidation'
import type { BlueprintReadResult } from './types'

export interface BlueprintEditData {
  blueprintId: number
  assignmentId: number
  isExercise: boolean
  options: BlueprintCreateOptions
  draft: BlueprintCreateDraft
  problems: readonly BlueprintCreateProblem[]
}

export interface BlueprintDeletionImpact {
  deletable: boolean
  submissionCount: number
  recordedStudentCount: number
  sectionCount: number
  assignmentCount: number
  studentCount: number
  qnaCount: number
  noticeCount: number
}

export interface BlueprintManagementSource {
  readEdit: (
    blueprintId: number,
    assignmentId: number
  ) => Promise<BlueprintReadResult<BlueprintEditData | null>>
  readDeletionImpact: (
    blueprintId: number,
    assignmentId: number
  ) => Promise<BlueprintReadResult<BlueprintDeletionImpact>>
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function id(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0
}

function uniqueIds(values: readonly number[]) {
  return new Set(values).size === values.length
}

function localDateTime(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value === '' || parseBlueprintScheduleDateTime(value) !== null)
  )
}

export function isCompleteBlueprintEditData(
  value: unknown
): value is BlueprintEditData {
  if (
    !record(value) ||
    !id(value.blueprintId) ||
    !id(value.assignmentId) ||
    typeof value.isExercise !== 'boolean' ||
    !record(value.options) ||
    !record(value.draft)
  ) {
    return false
  }
  const { options, draft } = value
  if (
    typeof options.courseTitle !== 'string' ||
    !Array.isArray(options.weeks) ||
    !options.weeks.every(id) ||
    !Array.isArray(options.sections) ||
    !options.sections.every(
      (section) =>
        record(section) &&
        id(section.groupId) &&
        typeof section.sectionLabel === 'string' &&
        typeof section.title === 'string' &&
        (section.semester === null || typeof section.semester === 'string') &&
        (section.memberCount === null ||
          (Number.isSafeInteger(section.memberCount) &&
            Number(section.memberCount) >= 0))
    ) ||
    typeof draft.title !== 'string' ||
    !id(draft.week) ||
    !options.weeks.includes(draft.week) ||
    typeof draft.description !== 'string' ||
    typeof draft.isJudgeResultVisible !== 'boolean' ||
    typeof draft.enableCopyPaste !== 'boolean' ||
    !Array.isArray(draft.problems) ||
    !Array.isArray(draft.sections) ||
    !Array.isArray(value.problems)
  ) {
    return false
  }
  const problems = value.problems
  const sections = options.sections
  if (
    !problems.every(
      (problem) =>
        record(problem) &&
        id(problem.id) &&
        typeof problem.title === 'string' &&
        typeof problem.level === 'string' &&
        typeof problem.hasSolution === 'boolean'
    ) ||
    !draft.problems.every(
      (problem) =>
        record(problem) &&
        id(problem.problemId) &&
        typeof problem.score === 'number' &&
        Number.isFinite(problem.score) &&
        ['hidden', 'after-due', 'manual'].includes(String(problem.solution)) &&
        (problem.manualReleaseTime === undefined ||
          localDateTime(problem.manualReleaseTime)) &&
        (problem.solution !== 'manual' ||
          localDateTime(problem.manualReleaseTime)) &&
        (problem.lastVisibleSolution === undefined ||
          ['after-due', 'manual'].includes(
            String(problem.lastVisibleSolution)
          )) &&
        problems.some((known) => known.id === problem.problemId)
    ) ||
    !draft.sections.every(
      (section) =>
        record(section) &&
        id(section.groupId) &&
        ['startTime', 'dueTime', 'endTime'].every((field) =>
          localDateTime(section[field])
        ) &&
        sections.some((known) => known.groupId === section.groupId)
    )
  ) {
    return false
  }
  return (
    uniqueIds(value.problems.map((problem) => problem.id)) &&
    uniqueIds(draft.problems.map((problem) => problem.problemId)) &&
    uniqueIds(draft.sections.map((section) => section.groupId)) &&
    uniqueIds(options.sections.map((section) => section.groupId)) &&
    options.sections.length === draft.sections.length
  )
}

export function isBlueprintDeletionImpact(
  value: unknown
): value is BlueprintDeletionImpact {
  return (
    record(value) &&
    typeof value.deletable === 'boolean' &&
    [
      'submissionCount',
      'recordedStudentCount',
      'sectionCount',
      'assignmentCount',
      'studentCount',
      'qnaCount',
      'noticeCount'
    ].every(
      (field) => Number.isSafeInteger(value[field]) && Number(value[field]) >= 0
    )
  )
}
