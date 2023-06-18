import { type AuthenticatedUser } from '@client/auth/class/authenticated-user.class'
import { PrismaService } from '@libs/prisma'
import {
  Injectable,
  type CanActivate,
  type ExecutionContext
} from '@nestjs/common'

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

    const valid = await this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        userId
      }
    })

    return valid ? true : false
  }
}
