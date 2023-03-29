import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { type AuthenticatedUser } from 'src/auth/class/authenticated-user.class'
import { type AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupService } from '../group.service'

@Injectable()
export class GroupLeaderGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const groupId: number = parseInt(request.params.groupId)
    const userId: number = request.user.id

    const userGroup = await this.groupService.getUserGroup(userId, groupId)
    const isGroupLeader: boolean = userGroup && userGroup.isGroupLeader

    if (isGroupLeader) {
      return true
    }
    return false
  }
}
