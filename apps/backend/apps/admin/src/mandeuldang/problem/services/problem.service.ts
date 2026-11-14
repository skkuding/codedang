import { Injectable } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  Prisma,
  ProblemCreationMode,
  ProblemStatus,
  Role
} from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { MandeuldangProblemOutput } from '../model/problem.output'

/** Upper bound for `take` in list queries. */
const MAX_TAKE = 100

/** Resolves the requester's collaboration role on a problem. */
const resolveMyRole = (
  problem: {
    createdById: number | null
    mandeuldangCollaborators: Array<{
      userId: number
      role: CollaboratorRole
      status: CollaboratorStatus
    }>
  },
  userId: number
): `${CollaboratorRole}` | null => {
  // The creator is always the Owner, even without a collaborator row.
  if (problem.createdById === userId) {
    return CollaboratorRole.Owner
  }
  const myCollaborator = problem.mandeuldangCollaborators.find(
    (collaborator) => collaborator.userId === userId
  )
  // Pending or rejected collaborators have no role.
  return myCollaborator?.status === CollaboratorStatus.Approved
    ? myCollaborator.role
    : null
}

@Injectable()
export class MandeuldangProblemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns Mandeuldang problems created by the given user, regardless of status.
   * Narrows to a single status when `status` is given.
   */
  async getProblemsByOwner(
    userId: number,
    cursor: number | null,
    take: number,
    status?: ProblemStatus
  ): Promise<MandeuldangProblemOutput[]> {
    return await this.findMandeuldangProblems(userId, cursor, take, {
      createdById: userId,
      ...(status && { status })
    })
  }

  /**
   * Returns unpublished Mandeuldang problems the user owns or collaborates on
   * as an approved collaborator. Narrows to a single status when `status` is given.
   */
  async getInProgressProblems(
    userId: number,
    cursor: number | null,
    take: number,
    status?: ProblemStatus
  ): Promise<MandeuldangProblemOutput[]> {
    return await this.findMandeuldangProblems(userId, cursor, take, {
      status: status ?? { not: ProblemStatus.Published },
      OR: [
        { createdById: userId },
        {
          mandeuldangCollaborators: {
            some: { userId, status: CollaboratorStatus.Approved }
          }
        }
      ]
    })
  }

  /**
   * Returns a Mandeuldang problem with its statement, publish readiness,
   * solution, tools, test files, collaborators, and the requester's role.
   *
   * Published problems are visible to everyone. Draft and Ready problems are
   * visible only to the owner, approved collaborators, and Admin/SuperAdmin.
   */
  async getProblem(
    id: number,
    userId: number,
    userRole: Role
  ): Promise<MandeuldangProblemOutput> {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        mandeuldangCollaborators: { include: { user: true } },
        mandeuldangSolution: true,
        mandeuldangTools: true,
        mandeuldangTestFiles: true
      }
    })

    if (!problem || problem.creationMode !== ProblemCreationMode.Mandeuldang) {
      throw new EntityNotExistException('MandeuldangProblem')
    }

    const myCollaborator = problem.mandeuldangCollaborators.find(
      (collaborator) => collaborator.userId === userId
    )
    const isOwner = problem.createdById === userId
    const isApprovedCollaborator =
      myCollaborator?.status === CollaboratorStatus.Approved
    const hasPrivilege = userRole === Role.Admin || userRole === Role.SuperAdmin

    const isVisible =
      problem.status === ProblemStatus.Published ||
      isOwner ||
      isApprovedCollaborator ||
      hasPrivilege

    if (!isVisible) {
      throw new ForbiddenAccessException(
        'Only the owner, an approved collaborator, or an admin can access a problem that is not yet published'
      )
    }

    const testFileCount = problem.mandeuldangTestFiles.length
    const missingForPublish: string[] = []
    if (!problem.description) missingForPublish.push('STATEMENT')
    if (!problem.mandeuldangSolution) missingForPublish.push('SOLUTION')
    if (testFileCount === 0) missingForPublish.push('TEST_FILES')

    return {
      ...problem,
      myRole: resolveMyRole(problem, userId),
      testFileCount,
      canPublish: missingForPublish.length === 0,
      missingForPublish
    }
  }

  private async findMandeuldangProblems(
    userId: number,
    cursor: number | null,
    take: number,
    where: Prisma.ProblemWhereInput
  ): Promise<MandeuldangProblemOutput[]> {
    const problems = await this.prisma.problem.findMany({
      ...this.prisma.getPaginator(cursor),
      take: Math.max(1, Math.min(take, MAX_TAKE)),
      where: { creationMode: ProblemCreationMode.Mandeuldang, ...where },
      include: {
        mandeuldangCollaborators: { where: { userId } }
      },
      orderBy: { updateTime: 'desc' }
    })
    return problems.map((problem) => ({
      ...problem,
      myRole: resolveMyRole(problem, userId)
    }))
  }
}
