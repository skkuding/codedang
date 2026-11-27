import type { Prisma } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import type { AssignmentLifecycleEvent } from './assignment-event.service'
import { assertAssignmentsHaveNoLearningRecords } from './assignment-learning-records'
import {
  lockAssignmentProblems,
  refreshAssignmentProblemAccess
} from './assignment-problem-access'

export const assertAssignmentUnlinked = (assignment: {
  blueprintAssignmentId?: number | null
}) => {
  if (assignment.blueprintAssignmentId != null) {
    throw new UnprocessableDataException(
      'Confirm unlinkBlueprintAssignment before editing this linked assignment'
    )
  }
}

export const lockBlueprintAssignment = async (
  tx: Prisma.TransactionClient,
  id: number
) => {
  await tx.$queryRaw`SELECT id FROM blueprint_assignment WHERE id = ${id} FOR UPDATE`
}

/** Caller locks the source first when these are linked copies. Guard all rows before deleting any. */
export const deleteAssignmentCopies = async (
  tx: Prisma.TransactionClient,
  targets: { id: number; groupId: number }[],
  events: AssignmentLifecycleEvent[]
) => {
  if (!targets.length) return []
  await assertAssignmentsHaveNoLearningRecords(
    tx,
    targets.map(({ id }) => id)
  )
  const copies = await tx.assignment.findMany({
    where: { OR: targets.map(({ id, groupId }) => ({ id, groupId })) },
    include: { assignmentProblem: true },
    orderBy: { id: 'asc' }
  })
  if (copies.length !== new Set(targets.map(({ id }) => id)).size)
    throw new EntityNotExistException('Assignment')
  await lockAssignmentProblems(
    tx,
    copies.flatMap((copy) =>
      copy.assignmentProblem.map(({ problemId }) => problemId)
    )
  )
  const affected = new Map<number, number[]>()
  const deleted = [] as Awaited<ReturnType<typeof tx.assignment.delete>>[]
  for (const copy of copies) {
    affected.set(copy.groupId, [
      ...(affected.get(copy.groupId) ?? []),
      ...copy.assignmentProblem.map(({ problemId }) => problemId)
    ])
    deleted.push(await tx.assignment.delete({ where: { id: copy.id } }))
    events.push({ name: 'assignment.deleted', assignmentId: copy.id })
  }
  for (const [groupId, problemIds] of affected)
    await refreshAssignmentProblemAccess(tx, problemIds, groupId)
  return deleted
}

export const deleteAssignmentCopy = async (
  tx: Prisma.TransactionClient,
  assignmentId: number,
  groupId: number,
  events: AssignmentLifecycleEvent[]
) => {
  const [deleted] = await deleteAssignmentCopies(
    tx,
    [{ id: assignmentId, groupId }],
    events
  )
  return deleted
}
