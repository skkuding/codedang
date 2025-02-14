import { Injectable, type ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { ADMIN_NOT_NEEDED_KEY } from '../guard.decorator'
import { ROLES_KEY } from './roles.decorator'
import { RolesGuard } from './roles.guard'

@Injectable()
export class AdminGuard extends RolesGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest
    if (context.getType<GqlContextType>() === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req
    } else {
      request = context.switchToHttp().getRequest()
    }

    const role =
      this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? Role.User

    // 반드시 admin 이상이 아니더라도 통과할 수 있는 경우를 상정 -> 이때는 각 guard 에서 해당 로직을 검증하는 것으로 처리
    const isAdminNotNeeded = this.reflector.getAllAndOverride<boolean>(
      ADMIN_NOT_NEEDED_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (
      isAdminNotNeeded === true &&
      this.rolesHierarchy[role] >= this.rolesHierarchy[Role.Admin]
    ) {
      return true
    }

    const userRole = await this.getUserRole(request)
    return this.rolesHierarchy[userRole] >= this.rolesHierarchy[role]
  }
}
