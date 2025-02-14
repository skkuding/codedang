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
  protected readonly rolesHierarchy: Record<string, number> = {}

  constructor(
    protected readonly reflector: Reflector,
    protected readonly service: RolesService
  ) {
    Object.keys(Role).forEach((key, index) => {
      this.rolesHierarchy[key] = index
    })
  }

  protected async getUserRole(request: AuthenticatedRequest): Promise<Role> {
    const user = request.user
    if (!user.role) {
      const userRole = (await this.service.getUserRole(user.id)).role
      user.role = userRole
    }
    return user.role
  }

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

    const userRole = await this.getUserRole(request)
    return this.rolesHierarchy[userRole] >= this.rolesHierarchy[role]
  }
}
