import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { OPEN_SPACE_ID } from '@libs/constants'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { RolesService } from './roles.service'

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(private readonly service: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      groupId =
        !request.query.groupId || request.query.groupId === '1'
          ? OPEN_SPACE_ID
          : parseInt(request.query.groupId as string)
    }

    if (groupId === OPEN_SPACE_ID) {
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
