import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Role, type User } from '@prisma/client'
import { ROLES_KEY } from '@libs/decorator'
import { PrismaService } from '@libs/prisma'
import type { AuthenticatedRequest } from '@client/auth/interface/authenticated-request.interface'

@Injectable()
export class RolesGuard implements CanActivate {
  #rolesHierarchy = {}

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {
    Object.keys(Role).forEach((key, index) => {
      this.#rolesHierarchy[key] = index
    })
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let role = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!role) {
      role = Role.Admin
    }

    const request: AuthenticatedRequest =
      GqlExecutionContext.create(context).getContext().req
    const userRole = await this.getUserRole(request.user.id)

    if (this.#rolesHierarchy[userRole.role] >= this.#rolesHierarchy[role]) {
      request.user.role = userRole.role
      return true
    }
    return false
  }

  private async getUserRole(userId: number): Promise<Partial<User>> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
    })
  }
}
