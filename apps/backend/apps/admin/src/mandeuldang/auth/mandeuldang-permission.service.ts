import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  ProblemStatus,
  Role
} from '@prisma/client'
import type { AuthenticatedRequest } from '@libs/auth'
import { PrismaService } from '@libs/prisma'
import type { MandeuldangRolesOptions } from './mandeuldang-roles.metadata'

type AccessOptions = Omit<MandeuldangRolesOptions, 'problemIdPath'>
type Requester = Pick<AuthenticatedRequest['user'], 'id' | 'role'>

/**
 * Checks access permissions for a Mandeuldang problem.
 *
 * - Owner: The original problem creator
 * - Editor/Reviewer: Determined by the approved collaborator's role
 */
@Injectable()
export class MandeuldangPermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async assertAccess(
    problemId: number,
    user: Requester,
    options: AccessOptions
  ): Promise<true> {
    if (!options || options.roles.length === 0) {
      throw new ForbiddenException('Problem permission is not configured')
    }

    const userId = user?.id
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new ForbiddenException('Authentication is required')
    }

    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        createdById: true,
        creationMode: true,
        status: true
      }
    })

    if (!problem || problem.creationMode !== ProblemCreationMode.Mandeuldang) {
      throw new NotFoundException('Mandeuldang problem not found')
    }

    if (options.allowPublished && problem.status === ProblemStatus.Published) {
      return true
    }

    if (
      options.allowAdmin &&
      (user.role === Role.Admin || user.role === Role.SuperAdmin)
    ) {
      return true
    }

    // Owner: The original problem creator
    if (problem.createdById === userId) {
      return this.assertAllowed(CollaboratorRole.Owner, options.roles)
    }

    const allowsCollaborator = options.roles.some(
      (role) =>
        role === CollaboratorRole.Editor || role === CollaboratorRole.Reviewer
    )

    if (!allowsCollaborator) {
      throw new ForbiddenException('No permission for this problem')
    }

    const collaborator = await this.prisma.mandeuldangCollaborator.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        problemId_userId: { problemId, userId }
      },
      select: {
        role: true,
        status: true
      }
    })

    // Editor: A collaborator with Approved status and the Editor role
    // Reviewer: A collaborator with Approved status and the Reviewer role
    if (
      !collaborator ||
      collaborator.status !== CollaboratorStatus.Approved ||
      (collaborator.role !== CollaboratorRole.Editor &&
        collaborator.role !== CollaboratorRole.Reviewer)
    ) {
      throw new ForbiddenException('No permission for this problem')
    }

    return this.assertAllowed(collaborator.role, options.roles)
  }

  /**
   * Denies access if the user's role is not in the allowed roles.
   */
  private assertAllowed(
    role: CollaboratorRole,
    allowedRoles: readonly CollaboratorRole[]
  ): true {
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('No permission for this problem')
    }

    return true
  }
}
