import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql'
import { ContestRole } from '@prisma/client'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { CONTEST_ROLES_DISABLE_KEY } from '../guard.decorator'
import { CONTEST_ROLES_KEY } from './contest-roles.decorator'
import { RolesService } from './roles.service'

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
    const isContestRolesNotNeeded = this.reflector.getAllAndOverride<boolean>(
      CONTEST_ROLES_DISABLE_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (isContestRolesNotNeeded === true) {
      return true
    }
    let request: AuthenticatedRequest
    let contestId: number
    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req
      contestId = parseInt(
        context
          .getArgs()
          .find((arg) => typeof arg === 'object' && 'contestId' in arg)
          ?.contestId ?? 0
      )
    } else {
      request = context.switchToHttp().getRequest()
      contestId = parseInt(request.query.contestId as string)
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
    if (user.isSuperAdmin()) {
      return true
    }

    const userContest = await this.service.getUserContest(user.id, contestId)
    if (
      userContest &&
      this.#rolesHierarchy[userContest.role] >= this.#rolesHierarchy[role]
    ) {
      return true
    }

    return false
  }
}
