import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { RolesService } from './roles.service'

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(private readonly service: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest
    let groupId: number | null
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
      groupId = !request.query.groupId
        ? null
        : parseInt(request.query.groupId as string)
    }

    // Public
    if (groupId === null) {
      return true
    }

    const user = request.user
    if (!user.role) {
      const userRole = (await this.service.getUserRole(user.id)).role
      user.role = userRole
    }
    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const userGroup = await this.service.getUserGroup(user.id, groupId)
    if (userGroup) {
      return true
    }
    return false
  }
}
