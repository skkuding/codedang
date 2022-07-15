import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GroupService } from '../group.service'

@Injectable()
export class GroupManagerGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const group_id = parseInt(request.params.group_id)
    const user_id = request.user.id

    if (!(await this.groupService.isUserGroupManager(user_id, group_id))) {
      return false
    }
    return true
  }
}
