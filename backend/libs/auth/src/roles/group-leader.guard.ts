import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import type { AuthenticatedUser } from '../authenticated-user.class'
import { RolesService } from './roles.service'

@Injectable()
export class GroupLeaderGuard implements CanActivate {
  constructor(private readonly service: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest
    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req
    } else {
      request = context.switchToHttp().getRequest()
    }

    const user: AuthenticatedUser = request.user
    if (!user.role) {
      const userRole = (await this.service.getUserRole(user.id)).role
      user.role = userRole
    }
    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const groupId: number = parseInt(request.params.groupId)
    const userId: number = user.id

    const userGroup = await this.service.getUserGroup(userId, groupId)
    const isGroupLeader: boolean = userGroup && userGroup.isGroupLeader

    if (isGroupLeader) {
      return true
    }
    return false
  }
}
