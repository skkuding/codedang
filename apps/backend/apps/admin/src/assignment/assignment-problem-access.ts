import type { Prisma } from '@prisma/client'
import { MAX_DATE, MIN_DATE } from '@libs/constants'

/** Hold problem locks in ID order across content writes and deletes. */
export const lockAssignmentProblems = async (
  tx: Prisma.TransactionClient,
  problemIds: number[]
) => {
  for (const id of [...new Set(problemIds)].sort((a, b) => a - b)) {
    await tx.$queryRaw`SELECT id FROM problem WHERE id = ${id} FOR UPDATE`
  }
}

/** Recompute after mutation, retaining public visibility for a removed public problem. */
export const refreshAssignmentProblemAccess = async (
  tx: Prisma.TransactionClient,
  problemIds: number[],
  groupId: number
) => {
  for (const id of [...new Set(problemIds)].sort((a, b) => a - b)) {
    const problem = await tx.problem.findUniqueOrThrow({ where: { id } })
    const assignments = await tx.assignmentProblem.findMany({
      where: { problemId: id },
      select: { assignment: { select: { endTime: true, groupId: true } } }
    })
    const workbookUse = await tx.workbookProblem.findFirst({
      where: { problemId: id, workbook: { groupId } },
      select: { problemId: true }
    })
    const contests = await tx.contestProblem.findMany({
      where: { problemId: id },
      select: { contest: { select: { endTime: true } } }
    })
    const ends = [
      ...assignments.map(({ assignment }) => assignment.endTime),
      ...contests.map(({ contest }) => contest.endTime)
    ]
    const visibleLockTime = ends.length
      ? new Date(Math.max(...ends.map(Number)))
      : MAX_DATE
    await tx.problem.update({
      where: { id },
      data: {
        visibleLockTime:
          problem.visibleLockTime.getTime() !== MIN_DATE.getTime()
            ? visibleLockTime
            : undefined,
        sharedGroups:
          workbookUse ||
          assignments.some(({ assignment }) => assignment.groupId === groupId)
            ? undefined
            : { disconnect: { id: groupId } }
      }
    })
  }
}
