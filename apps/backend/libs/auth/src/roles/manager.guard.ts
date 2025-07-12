import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql'
import { ContestRole } from '@prisma/client'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { RolesService } from './roles.service'

/**
 * @summary Course 또는 Contest를 관리할 수 있는 권한을 확인하는 가드
 *
 * @description
 * 사용자가 다음 조건 중 하나라도 만족하면 접근을 허용합니다:
 * - Super Admin 또는 Admin
 * - canCreateCourse 또는 canCreateContest가 true
 * - 하나 이상의 Group에서 groupLeader
 * - 하나 이상의 Contest에서 Role이 Manager 이상
 */
@Injectable()
export class ManagerGuard implements CanActivate {
  constructor(private readonly service: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest

    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context)
      request = gqlContext.getContext().req
    } else {
      request = context.switchToHttp().getRequest()
    }

    const user = request.user

    if (user.isSuperAdmin?.() || user.isAdmin?.()) {
      return true
    }

    const userRole = await this.service.getUserRole(user.id)
    if (userRole.canCreateCourse || userRole.canCreateContest) {
      return true
    }

    const leadingGroup = await this.service.findLeaderGroup(user.id)

    if (leadingGroup) {
      return true
    }

    const userContest = await this.service.findUserContestByRole(user.id, [
      ContestRole.Manager,
      ContestRole.Admin
    ])

    if (userContest) {
      return true
    }

    return false
  }
}
