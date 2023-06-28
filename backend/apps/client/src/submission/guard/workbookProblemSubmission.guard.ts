import { type AuthenticatedUser } from '@client/auth/class/authenticated-user.class'
import { PrismaService } from '@libs/prisma'
import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException
} from '@nestjs/common'

@Injectable()
export class WorkbookProblemSubmissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const workbookId: number = parseInt(request.params.workbookId)
    const problemId: number = parseInt(request.params.problemId)
    const userId: number = request.user.id

    const groupId = await this.prisma.workbookProblem
      .findFirstOrThrow({
        where: {
          workbookId,
          problemId
        },
        include: {
          workbook: {
            include: {
              group: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      })
      .then((result) => result.workbook.groupId)
      .catch(() => {
        throw new ForbiddenException()
      })

    await this.prisma.userGroup
      .findFirstOrThrow({
        where: {
          userId,
          groupId
        }
      })
      .then(() => [])
      .catch(() => {
        throw new ForbiddenException()
      })

    return true
  }
}
