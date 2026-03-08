import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  console.log('Starting Assignment Record Script.')

  const leaders = await prisma.userGroup.findMany({
    where: {
      groupId: 10,
      isGroupLeader: true
    }
  })

  if (leaders.length === 0) {
    console.error('leader does not find!')
    return
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      groupId: 10
    },
    select: {
      id: true,
      assignmentProblem: {
        select: {
          problemId: true
        }
      }
    }
  })

  if (assignments.length === 0) {
    console.error('Assignment does not find!')
    return
  }

  const userIds = leaders.map((l) => l.userId)
  const assignmentIds = assignments.map((a) => a.id)

  console.log('Target User IDs:', userIds)
  console.log('Target Assignment IDs:', assignmentIds)

  for (const leader of leaders) {
    const userId = leader.userId

    for (const assignment of assignments) {
      const assignmentId = assignment.id
      const problemRecordData = assignment.assignmentProblem.map(
        ({ problemId }) => ({ assignmentId, userId, problemId })
      )

      try {
        await prisma.$transaction(async (tx) => {
          await tx.assignmentRecord.create({
            data: { assignmentId, userId }
          })

          await tx.assignmentProblemRecord.createMany({
            data: problemRecordData,
            skipDuplicates: true
          })
        })

        console.log(
          `Created records for user ${userId} in assignment ${assignmentId}`
        )
      } catch (error) {
        console.error(
          `Failed to create records for user ${userId} in assignment ${assignmentId}:`,
          error
        )
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
