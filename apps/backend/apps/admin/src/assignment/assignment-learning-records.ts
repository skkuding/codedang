import { Prisma } from '@prisma/client'
import { ConflictFoundException } from '@libs/exception'

/** Empty enrollment/record rows are not learning activity. Shared by impact reads and guarded writes. */
export const getAssignmentLearningRecords = async (
  tx: Prisma.TransactionClient,
  assignmentIds: number[]
) => {
  const ids = [...new Set(assignmentIds)]
  if (!ids.length) return { submissionCount: 0, recordedStudentCount: 0 }
  const [submissionCount, students] = await Promise.all([
    tx.submission.count({ where: { assignmentId: { in: ids } } }),
    tx.assignmentProblemRecord.groupBy({
      by: ['userId'],
      where: {
        assignmentId: { in: ids },
        OR: [
          { isSubmitted: true },
          { finalScore: { not: null } },
          { comment: { not: '' } }
        ]
      }
    })
  ])
  return { submissionCount, recordedStudentCount: students.length }
}

/**
 * Run inside the mutation transaction, before any content is removed or changed.
 * Lock Assignment -> AssignmentProblem -> APR in stable order. The additional
 * problem-row locks also block an APR INSERT/upsert when its row did not exist yet.
 */
export const assertAssignmentsHaveNoLearningRecords = async (
  tx: Prisma.TransactionClient,
  assignmentIds: number[]
) => {
  const ids = [...new Set(assignmentIds)].sort((a, b) => a - b)
  if (!ids.length) return
  await tx.$queryRaw`SELECT id FROM "assignment" WHERE id IN (${Prisma.join(ids)}) ORDER BY id FOR UPDATE`
  await tx.$queryRaw`SELECT "assignment_id", "problem_id" FROM "assignment_problem" WHERE "assignment_id" IN (${Prisma.join(ids)}) ORDER BY "assignment_id", "problem_id" FOR UPDATE`
  await tx.$queryRaw`SELECT "assignmentId", "userId", "problemId" FROM "assignment_problem_record" WHERE "assignmentId" IN (${Prisma.join(ids)}) ORDER BY "assignmentId", "userId", "problemId" FOR UPDATE`
  const records = await getAssignmentLearningRecords(tx, ids)
  if (records.submissionCount || records.recordedStudentCount)
    throw new ConflictFoundException('Learning records exist')
}
