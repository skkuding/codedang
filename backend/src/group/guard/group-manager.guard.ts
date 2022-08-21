import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthenticatedUser } from 'src/auth/class/authenticated-user.class'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupService } from '../group.service'

@Injectable()
export class GroupManagerGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isSuperAdmin() || user.isSuperManager()) {
      return true
    }

    const groupId: number = parseInt(request.params.groupId)
    const userId: number = request.user.id

    const userGroupMemberShipInfo =
      await this.groupService.getUserGroupMembershipInfo(userId, groupId)

    const isGroupManager: boolean =
      userGroupMemberShipInfo &&
      userGroupMemberShipInfo.isRegistered &&
      userGroupMemberShipInfo.isGroupManager

    if (isGroupManager) {
      return true
    }
    return false
  }
}
