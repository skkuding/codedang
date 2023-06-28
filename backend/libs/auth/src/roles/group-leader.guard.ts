import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import type { AuthenticatedUser } from '../authenticated-user.class'
import { RolesService } from './roles.service'

@Injectable()
export class GroupLeaderGuard implements CanActivate {
  constructor(private readonly service: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const groupId: number = parseInt(request.params.groupId)
    const userId: number = request.user.id

    const userGroup = await this.service.getUserGroup(userId, groupId)
    const isGroupLeader: boolean = userGroup && userGroup.isGroupLeader

    if (isGroupLeader) {
      return true
    }
    return false
  }
}
