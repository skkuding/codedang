import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { AuthenticatedUser } from '@libs/auth'
import { MAX_DATE, MIN_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { assertAssignmentsHaveNoLearningRecords } from '@admin/assignment/assignment-learning-records'
import { lockBlueprintAssignment } from '@admin/assignment/assignment-link'
import { lockAssignmentProblems } from '@admin/assignment/assignment-problem-access'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import type { BlueprintAssignmentProblemInput } from './model/blueprint-assignment-problem.input'

@Injectable()
export class BlueprintAssignmentProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blueprintAccessService: BlueprintAccessService
  ) {}

  async getBlueprintAssignmentProblems(
    user: AuthenticatedUser,
    blueprintAssignmentId: number
  ) {
    await this.assertAccess(user, blueprintAssignmentId)

    return await this.prisma.blueprintAssignmentProblem.findMany({
      where: { blueprintAssignmentId },
      orderBy: { order: 'asc' }
    })
  }

  async importProblemsToBlueprintAssignment(
    user: AuthenticatedUser,
    blueprintAssignmentId: number,
    problems: BlueprintAssignmentProblemInput[]
  ) {
    await this.assertAccess(user, blueprintAssignmentId)

    // Keep the first entry when the same problem is sent twice.
    const uniqueProblems = problems.filter(
      (problem, index) =>
        problems.findIndex((p) => p.problemId === problem.problemId) === index
    )
    const problemIds = uniqueProblems.map(({ problemId }) => problemId)

    return await this.prisma.$transaction(async (tx) => {
      await lockBlueprintAssignment(tx, blueprintAssignmentId)

      const copies = await tx.assignment.findMany({
        where: { blueprintAssignmentId },
        select: { id: true, groupId: true, endTime: true },
        orderBy: { id: 'asc' }
      })
      const copyIds = copies.map(({ id }) => id)
      await assertAssignmentsHaveNoLearningRecords(tx, copyIds)

      const existingProblems = await tx.problem.findMany({
        where: { id: { in: problemIds } },
        select: { id: true }
      })
      if (existingProblems.length !== problemIds.length) {
        throw new EntityNotExistException('Problem')
      }
      await this.assertProblemAccess(tx, user, problemIds)
      await lockAssignmentProblems(tx, problemIds)

      const current = await tx.blueprintAssignmentProblem.findMany({
        where: { blueprintAssignmentId },
        select: { problemId: true }
      })
      const imported = new Set(current.map(({ problemId }) => problemId))
      const data = uniqueProblems
        .filter(({ problemId }) => !imported.has(problemId))
        .map(({ problemId, score }, index) => ({
          blueprintAssignmentId,
          problemId,
          score,
          order: current.length + index
        }))
      if (!data.length) {
        return []
      }
      const addedIds = data.map(({ problemId }) => problemId)

      await tx.blueprintAssignmentProblem.createMany({ data })

      if (copies.length) {
        await tx.assignmentProblem.createMany({
          data: copies.flatMap((copy) =>
            data.map(({ problemId, score, order }) => ({
              assignmentId: copy.id,
              problemId,
              score,
              order
            }))
          ),
          skipDuplicates: true
        })

        for (const problemId of addedIds) {
          await tx.problem.update({
            where: { id: problemId },
            data: {
              sharedGroups: {
                connect: copies.map(({ groupId }) => ({ id: groupId }))
              }
            }
          })
        }

        // Same rule as importProblemsToAssignment: lock until the latest copy ends.
        const latestEndTime = new Date(
          Math.max(...copies.map(({ endTime }) => endTime.getTime()))
        )
        await tx.problem.updateMany({
          where: {
            id: { in: addedIds },
            OR: [
              { visibleLockTime: { equals: MIN_DATE } },
              { visibleLockTime: { equals: MAX_DATE } },
              { visibleLockTime: { lte: latestEndTime } }
            ]
          },
          data: { visibleLockTime: latestEndTime }
        })

        const participants = await tx.assignmentRecord.findMany({
          where: { assignmentId: { in: copyIds }, userId: { not: null } },
          select: { assignmentId: true, userId: true }
        })
        if (participants.length) {
          await tx.assignmentProblemRecord.createMany({
            data: participants.flatMap(({ assignmentId, userId }) =>
              addedIds.map((problemId) => ({
                assignmentId,
                userId: userId!,
                problemId
              }))
            ),
            skipDuplicates: true
          })
        }
      }

      return await tx.blueprintAssignmentProblem.findMany({
        where: { blueprintAssignmentId, problemId: { in: addedIds } },
        orderBy: { order: 'asc' }
      })
    })
  }

  // Same rule as the problem API: creator or leader of a shared group.
  private async assertProblemAccess(
    tx: Prisma.TransactionClient,
    user: AuthenticatedUser,
    problemIds: number[]
  ) {
    if (user.isAdmin() || user.isSuperAdmin()) {
      return
    }
    const leaderGroups = await tx.userGroup.findMany({
      where: { userId: user.id, isGroupLeader: true },
      select: { groupId: true }
    })
    const accessible = await tx.problem.findMany({
      where: {
        id: { in: problemIds },
        OR: [
          { createdById: user.id },
          {
            sharedGroups: {
              some: { id: { in: leaderGroups.map(({ groupId }) => groupId) } }
            }
          }
        ]
      },
      select: { id: true }
    })
    if (accessible.length !== problemIds.length) {
      throw new ForbiddenAccessException('No access to some problems')
    }
  }

  private async assertAccess(
    user: AuthenticatedUser,
    blueprintAssignmentId: number
  ) {
    const blueprintAssignment =
      await this.prisma.blueprintAssignment.findUnique({
        where: { id: blueprintAssignmentId },
        select: { blueprintCourseId: true }
      })
    if (!blueprintAssignment) {
      throw new EntityNotExistException('BlueprintAssignment')
    }
    await this.blueprintAccessService.assertBlueprintLeader(
      user,
      blueprintAssignment.blueprintCourseId
    )
  }
}
