import type { Assignment, Prisma } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import type { AssignmentLifecycleEvent } from './assignment-event.service'
import { refreshAssignmentProblemAccess } from './assignment-problem-access'

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
export type AssignmentCommonContent = Pick<
  Assignment,
  | 'title'
  | 'description'
  | 'week'
  | 'enableCopyPaste'
  | 'autoFinalizeScore'
  | 'isExercise'
>

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

/** Source/assignment locks are acquired by the caller; never modifies the Link or problem settings. */
export const updateAssignmentSectionSettings = async (
  tx: Prisma.TransactionClient,
  current: Prisma.AssignmentGetPayload<{
    include: { assignmentProblem: true }
  }>,
  patch: AssignmentSectionSettingsPatch,
  events: AssignmentLifecycleEvent[],
  commonContent: Partial<AssignmentCommonContent> = {}
) => {
  const settings = resolveAssignmentSectionSettings(current, patch)
  const data = Object.fromEntries(
    Object.entries({ ...commonContent, ...settings }).filter(([key, value]) => {
      if (value === undefined) return false
      const previous = current[key as keyof Assignment]
      return previous instanceof Date && value instanceof Date
        ? previous.getTime() !== value.getTime()
        : previous !== value
    })
  )
  if (!Object.keys(data).length) return current
  const endTimeChanged = data.endTime !== undefined
  const problemIds = current.assignmentProblem.map(({ problemId }) => problemId)
  // The caller acquires all affected problem locks in ID order before section updates.
  const updated = await tx.assignment.update({
    where: { id: current.id },
    data
  })
  if (endTimeChanged)
    await refreshAssignmentProblemAccess(tx, problemIds, current.groupId)
  const oldDeadline = current.dueTime ?? current.endTime
  const newDeadline = updated.dueTime ?? updated.endTime
  if (oldDeadline.getTime() !== newDeadline.getTime()) {
    events.push({
      name: 'assignment.updated',
      assignmentId: updated.id,
      dueTime: newDeadline
    })
  }
  if (!current.isFinalScoreVisible && updated.isFinalScoreVisible) {
    events.push({ name: 'assignment.graded', assignmentId: updated.id })
  }
  return updated
}
