import type { Assignment } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'

export const ASSIGNMENT_SECTION_SETTING_KEYS = [
  'startTime',
  'dueTime',
  'endTime',
  'isVisible',
  'isFinalScoreVisible',
  'isRankVisible',
  'isJudgeResultVisible'
] as const

export type AssignmentSectionSettings = Pick<
  Assignment,
  (typeof ASSIGNMENT_SECTION_SETTING_KEYS)[number]
>
export type AssignmentSectionSettingsPatch = Partial<AssignmentSectionSettings>
/** Undefined leaves a value unchanged; null clears dueTime only. */
export const resolveAssignmentSectionSettings = (
  current: AssignmentSectionSettings,
  patch: AssignmentSectionSettingsPatch
): AssignmentSectionSettingsPatch => {
  const provided: AssignmentSectionSettingsPatch = {}
  for (const key of ['startTime', 'dueTime', 'endTime'] as const) {
    const value = patch[key]
    if (value === undefined) continue
    if (value === null && key === 'dueTime') {
      provided.dueTime = null
      continue
    }
    if (!(value instanceof Date) || !Number.isFinite(value.getTime()))
      throw new UnprocessableDataException(`${key} must be a valid date`)
    provided[key] = value
  }
  for (const key of [
    'isVisible',
    'isFinalScoreVisible',
    'isRankVisible',
    'isJudgeResultVisible'
  ] as const) {
    const value = patch[key]
    if (value === undefined) continue
    if (typeof value !== 'boolean')
      throw new UnprocessableDataException(`${key} must be a boolean`)
    provided[key] = value
  }
  const next = { ...current, ...provided }
  if (
    !(next.startTime instanceof Date) ||
    !(next.endTime instanceof Date) ||
    !Number.isFinite(Number(next.startTime)) ||
    !Number.isFinite(Number(next.endTime)) ||
    next.startTime >= next.endTime
  )
    throw new UnprocessableDataException(
      'The startTime must be earlier than the endTime'
    )
  if (
    next.dueTime !== null &&
    (!(next.dueTime instanceof Date) ||
      !Number.isFinite(Number(next.dueTime)) ||
      next.startTime >= next.dueTime)
  )
    throw new UnprocessableDataException(
      'The startTime must be earlier than the dueTime'
    )
  if (next.dueTime !== null && next.dueTime > next.endTime)
    throw new UnprocessableDataException(
      'The dueTime must not be later than the endTime'
    )
  return provided
}
