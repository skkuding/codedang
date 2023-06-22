import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import type { AuthenticatedRequest } from '../authenticated-request.interface'
import { ROLES_KEY } from './roles.decorator'
import { RolesService } from './roles.service'

@Injectable()
export class RolesGuard implements CanActivate {
  #rolesHierarchy = {}

  constructor(
    private readonly reflector: Reflector,
    private readonly service: RolesService
  ) {
    Object.keys(Role).forEach((key, index) => {
      this.#rolesHierarchy[key] = index
    })
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: AuthenticatedRequest
    let role = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (context.getType<GqlContextType>() === 'graphql') {
      if (!role) role = Role.Admin
      request = GqlExecutionContext.create(context).getContext().req
    } else {
      if (!role) role = Role.User
      request = context.switchToHttp().getRequest()
    }
    const userRole = (await this.service.getUserRole(request.user.id)).role

    if (this.#rolesHierarchy[userRole] >= this.#rolesHierarchy[role]) {
      request.user.role = userRole
      return true
    }
    return false
  }
}
