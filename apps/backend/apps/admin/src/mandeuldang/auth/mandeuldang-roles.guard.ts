import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import type { AuthenticatedRequest } from '@libs/auth'
import { MandeuldangPermissionService } from './mandeuldang-permission.service'
import {
  MANDEULDANG_ROLES_KEY,
  type MandeuldangRolesOptions
} from './mandeuldang-roles.metadata'

/**
 * Controls API access based on Owner, Editor, and Reviewer roles.
 *
 * - Owner: The original problem creator
 * - Editor/Reviewer: Collaborators with Approved status
 * - Allows access when the user's role is included in the decorator's roles array.
 * - Also allows access when the configured allowPublished or allowAdmin condition is met.
 */
@Injectable()
export class MandeuldangRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: MandeuldangPermissionService
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

    return this.permissionService.assertAccess(problemId, req.user, options)
  }

  /**
   * Extracts and validates the problem ID from GraphQL arguments.
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
