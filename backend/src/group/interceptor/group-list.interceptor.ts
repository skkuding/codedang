import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { UserGroup } from '@prisma/client'
import { GroupService } from '../group.service'

@Injectable()
export class GroupListInterceptor implements NestInterceptor {
  constructor(private readonly groupService: GroupService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const userId = parseInt(request.user.id)

    const managingGroups: Partial<UserGroup>[] =
      await this.groupService.getUserGroupManagerList(userId)

    const managingGroupIds = managingGroups.map((group) => group.group_id)
    request.params['group_ids'] = managingGroupIds

    return next.handle()
  }
}
