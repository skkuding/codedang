import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GroupService } from '../group.service'

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const group_id: number = parseInt(request.params.group_id)
    const user_id: number = request.user.id

    const userGroupMemberShipInfo =
      await this.groupService.getUserGroupMembershipInfo(user_id, group_id)

    const isGroupMember: boolean =
      userGroupMemberShipInfo && userGroupMemberShipInfo.is_registered

    if (isGroupMember) {
      return true
    }
    return false
  }
}
