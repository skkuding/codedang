import { PROBLEM_IMPORT_LIMIT } from '@/app/admin/blueprint/_libs/problemImport'
import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions,
  BlueprintCreateProblem,
  BlueprintSectionSchedule
} from './createTypes'

export const BLUEPRINT_CREATE_SCHEDULE_POLICY = {
  startBeforeEnd: true,
  startBeforeDue: true,
  dueAtOrBeforeEnd: true
} as const

export function parseBlueprintScheduleDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value
  )
  if (!match) {
    return null
  }
  const [year, month, day, hour, minute, second] = match
    .slice(1)
    .map((part) => Number(part ?? 0))
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null
  }
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, 0)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return new Date(date.getTime() - 9 * 60 * 60 * 1000)
}

function hasDescription(description: string): boolean {
  const content = description
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  if (/<img\b[^>]*\bsrc\s*=\s*['"][^'"]+['"][^>]*>/i.test(content)) {
    return true
  }
  return Boolean(
    content
      .replace(/<[^>]*>/g, '')
      .replace(/&(?:nbsp|#0*160|#x0*a0|#0*8203|#x0*200b);/gi, '')
      .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
  )
}

function isIdentifier(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0
}

export function validateBlueprintCreateDraft(
  draft: BlueprintCreateDraft,
  options: BlueprintCreateOptions,
  isExercise: boolean,
  problems: readonly BlueprintCreateProblem[] = []
): Record<string, string> {
  const errors: Record<string, string> = {}
  const title = draft.title.trim()
  if (title.length < 1 || title.length > 120) {
    errors.title = 'Enter a title between 1 and 120 characters.'
  }
  if (
    draft.week === null ||
    !isIdentifier(draft.week) ||
    !options.weeks.includes(draft.week)
  ) {
    errors.week = 'Select an available week.'
  }
  if (!hasDescription(draft.description)) {
    errors.description = 'Enter a description.'
  }

  const problemIds = new Set<number>()
  if (draft.problems.length > PROBLEM_IMPORT_LIMIT) {
    errors.problems = `Select up to ${PROBLEM_IMPORT_LIMIT} problems.`
  }
  for (const problem of draft.problems) {
    const available = problems.find((item) => item.id === problem.problemId)
    if (
      !isIdentifier(problem.problemId) ||
      problemIds.has(problem.problemId) ||
      !available
    ) {
      errors.problems = 'Select unique problems from the available list.'
    } else if (
      !['hidden', 'after-due', 'manual'].includes(problem.solution) ||
      (!available.hasSolution && problem.solution !== 'hidden')
    ) {
      errors.problems = 'Choose a valid solution option for each problem.'
    }
    if (
      problem.solution === 'manual' &&
      parseBlueprintScheduleDateTime(problem.manualReleaseTime ?? '') === null
    ) {
      const message = 'Enter a valid manual solution release time (Asia/Seoul).'
      errors.problems = message
      errors[`problems.${problem.problemId}.manualReleaseTime`] = message
    }
    if (
      !isExercise &&
      (!Number.isSafeInteger(problem.score) || problem.score < 0)
    ) {
      errors.problems = 'Assignment scores must be nonnegative integers.'
    }
    problemIds.add(problem.problemId)
  }

  if (draft.sections.length === 0) {
    errors.sections = 'Select at least one section.'
  }
  const groupIds = new Set<number>()
  for (const section of draft.sections) {
    if (
      !isIdentifier(section.groupId) ||
      groupIds.has(section.groupId) ||
      !options.sections.some((item) => item.groupId === section.groupId)
    ) {
      errors.sections = 'Select unique sections from this Blueprint.'
    }
    groupIds.add(section.groupId)
    const prefix = `sections.${section.groupId}`
    const start = parseBlueprintScheduleDateTime(section.startTime)
    const due = section.dueTime
      ? parseBlueprintScheduleDateTime(section.dueTime)
      : null
    const end = parseBlueprintScheduleDateTime(section.endTime)
    if (start === null) {
      errors[`${prefix}.startTime`] = 'Enter a valid start time (Asia/Seoul).'
    }
    if (end === null) {
      errors[`${prefix}.endTime`] = 'Enter a valid end time (Asia/Seoul).'
    }
    if (section.dueTime && due === null) {
      errors[`${prefix}.dueTime`] = 'Enter a valid due time (Asia/Seoul).'
    }
    if (
      BLUEPRINT_CREATE_SCHEDULE_POLICY.startBeforeEnd &&
      start &&
      end &&
      start >= end
    ) {
      errors[`${prefix}.endTime`] = 'End time must be later than start time.'
    }
    if (
      BLUEPRINT_CREATE_SCHEDULE_POLICY.startBeforeDue &&
      start &&
      due &&
      start >= due
    ) {
      errors[`${prefix}.dueTime`] = 'Due time must be later than start time.'
    }
    if (
      BLUEPRINT_CREATE_SCHEDULE_POLICY.dueAtOrBeforeEnd &&
      due &&
      end &&
      due > end
    ) {
      errors[`${prefix}.dueTime`] = 'Due time cannot be later than end time.'
    }
  }
  return errors
}

export function applyBlueprintScheduleToSelected(
  draft: BlueprintCreateDraft,
  field: Exclude<keyof BlueprintSectionSchedule, 'groupId'>,
  value: string
): BlueprintCreateDraft {
  return {
    ...draft,
    sections: draft.sections.map((section) => ({
      ...section,
      [field]: value
    }))
  }
}
