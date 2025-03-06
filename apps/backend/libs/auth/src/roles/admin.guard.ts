import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { ADMIN_NOT_NEEDED_KEY } from '../guard.decorator'
import { RolesService } from './roles.service'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    protected readonly service: RolesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 반드시 admin 이상이 아니더라도 통과할 수 있는 경우를 상정 -> 이때는 각 guard 에서 해당 로직을 검증하는 것으로 처리
    const isAdminNotNeeded = this.reflector.getAllAndOverride<boolean>(
      ADMIN_NOT_NEEDED_KEY,
      [context.getHandler(), context.getClass()]
    )

    let request: AuthenticatedRequest
    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req
    } else {
      request = context.switchToHttp().getRequest()
    }

    const user = request.user
    if (!user.role) {
      const userRole = (await this.service.getUserRole(user.id)).role
      user.role = userRole
    }

    if (isAdminNotNeeded === true) {
      return true
    }
    if (user.role === Role.User) {
      return false
    }
    return true
  }
}
