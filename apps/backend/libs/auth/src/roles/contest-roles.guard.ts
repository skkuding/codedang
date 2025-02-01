import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql'
import { ContestRole } from '@prisma/client'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { CONTEST_ROLES_KEY } from './contest-roles.decorator'
import type { RolesService } from './roles.service'

@Injectable()
export class ContestRolesGuard implements CanActivate {
  #rolesHierarchy = {}

  constructor(
    private readonly reflector: Reflector,
    private readonly service: RolesService
  ) {
    Object.keys(ContestRole).forEach((key, index) => {
      this.#rolesHierarchy[key] = index
    })
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest
    let constestId: number
    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req
      constestId = parseInt(
        context
          .getArgs()
          .find((arg) => typeof arg === 'object' && 'contestId' in arg)
          ?.contestId ?? 0
      )
    } else {
      request = context.switchToHttp().getRequest()
      constestId = parseInt(request.query.groupId as string)
    }

    const role =
      this.reflector.getAllAndOverride<ContestRole>(CONTEST_ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? ContestRole.Participant

    const user = request.user
    if (!user.role) {
      const userRole = (await this.service.getUserRole(user.id)).role
      user.role = userRole
    }
    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const userContest = await this.service.getUserContest(user.id, constestId)
    if (
      userContest &&
      this.#rolesHierarchy[userContest.role] >= this.#rolesHierarchy[role]
    ) {
      return true
    }

    return false
  }
}
