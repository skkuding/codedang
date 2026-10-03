import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode
} from '@prisma/client'
import type { AuthenticatedRequest } from '@libs/auth'
import { PrismaService } from '@libs/prisma'
import {
  MANDEULDANG_ROLES_KEY,
  type MandeuldangRolesOptions
} from './mandeuldang-roles.metadata'

/**
 * Owner, Editor, Reviewer 역할에 따라 API 접근을 제어한다.
 *
 * - Owner: 문제 최초 생성자(createdById)
 * - Editor/Reviewer: Approved 상태의 협업자
 * - 판정된 역할이 데코레이터의 roles 배열에 포함되면 요청을 허용한다.
 *   예: roles가 [Owner, Editor]이면 Owner 또는 Approved Editor만 허용한다.
 */
@Injectable()
export class MandeuldangRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<MandeuldangRolesOptions>(
      MANDEULDANG_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!options || options.roles.length === 0) {
      throw new ForbiddenException('Problem permission is not configured')
    }

    const gqlContext = GqlExecutionContext.create(context)
    const { req } = gqlContext.getContext<{
      req: AuthenticatedRequest
    }>()

    const userId = req.user?.id
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new ForbiddenException('Authentication is required')
    }

    const problemId = this.getProblemId(
      gqlContext.getArgs<Record<string, unknown>>(),
      options.problemIdPath
    )

    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        createdById: true,
        creationMode: true
      }
    })

    // 기존 문제에 만들당 협업 권한 정책이 적용되지 않도록 제한한다.
    if (!problem || problem.creationMode !== ProblemCreationMode.Mandeuldang) {
      throw new NotFoundException('Mandeuldang problem not found')
    }

    // Owner의 접근 권한을 확인한다.
    if (problem.createdById === userId) {
      return this.assertAllowed(CollaboratorRole.Owner, options.roles)
    }

    // 허용 역할에 Editor 또는 Reviewer가 포함되는지 확인한다.
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

    // Approved 상태의 Editor 또는 Reviewer인지 확인한다.
    if (
      !collaborator ||
      collaborator.status !== CollaboratorStatus.Approved ||
      (collaborator.role !== CollaboratorRole.Editor &&
        collaborator.role !== CollaboratorRole.Reviewer)
    ) {
      throw new ForbiddenException('No permission for this problem')
    }

    // 요청자의 역할이 API의 허용 역할에 포함되는지 확인한다.
    return this.assertAllowed(collaborator.role, options.roles)
  }

  private assertAllowed(
    role: CollaboratorRole,
    allowedRoles: readonly CollaboratorRole[]
  ): true {
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('No permission for this problem')
    }

    return true
  }

  /**
   * GraphQL 인자에서 지정된 경로의 문제 ID를 추출한다.
   * 예: 'problemId', 'input.id'
   */
  private getProblemId(
    args: Record<string, unknown>,
    path: MandeuldangRolesOptions['problemIdPath']
  ): number {
    let value: unknown = args

    for (const key of path.split('.')) {
      if (
        value === null ||
        typeof value !== 'object' ||
        !Object.prototype.hasOwnProperty.call(value, key)
      ) {
        throw new BadRequestException('Invalid problem ID')
      }

      value = (value as Record<string, unknown>)[key]
    }

    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value <= 0
    ) {
      throw new BadRequestException('Invalid problem ID')
    }

    return value
  }
}
