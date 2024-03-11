import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import type { AuthenticatedUser } from '../authenticated-user.class'
import { LEADER_NOT_NEEDED_KEY } from '../guard.decorator'
import { RolesService } from './roles.service'

@Injectable()
export class GroupLeaderGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly service: RolesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isLeaderNotNeeded = this.reflector.getAllAndOverride<boolean>(
      LEADER_NOT_NEEDED_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (isLeaderNotNeeded) {
      return true
    }

    let request: AuthenticatedRequest
    let groupId: number
    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req
      groupId = parseInt(
        context
          .getArgs()
          .find((arg) => typeof arg === 'object' && 'groupId' in arg)
          ?.groupId ?? 0
      )
    } else {
      request = context.switchToHttp().getRequest()
      groupId = parseInt(request.params.groupId)
    }

    const user: AuthenticatedUser = request.user
    if (!user.role) {
      const userRole = (await this.service.getUserRole(user.id)).role
      user.role = userRole
    }
    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const userGroup = await this.service.getUserGroup(user.id, groupId)
    const isGroupLeader = userGroup?.isGroupLeader
    if (isGroupLeader) {
      return true
    }
    return false
  }
}
