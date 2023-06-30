import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException
} from '@nestjs/common'
import type { AuthenticatedUser } from '@libs/auth'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class SubmissionResultGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const submissionId: string = request.params.submissionId
    const userId: number = request.user.id

    await this.prisma.submission
      .findFirstOrThrow({
        where: {
          id: submissionId,
          userId
        }
      })
      .then(() => [])
      .catch(() => {
        throw new ForbiddenException()
      })

    return true
  }
}
