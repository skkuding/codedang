import { type AuthenticatedUser } from '@client/auth/class/authenticated-user.class'
import { PrismaService } from '@libs/prisma'
import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException
} from '@nestjs/common'

@Injectable()
export class ContestProblemSubmissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user: AuthenticatedUser = request.user

    if (user.isAdmin() || user.isSuperAdmin()) {
      return true
    }

    const now: Date = new Date()
    const contestId: number = parseInt(request.params.contestId)
    const problemId: number = parseInt(request.params.problemId)
    const userId: number = request.user.id

    const groupId = await this.prisma.contestProblem
      .findFirstOrThrow({
        where: {
          contestId,
          problemId
        },
        include: {
          contest: {
            select: {
              group: {
                select: {
                  id: true
                }
              },
              startTime: true,
              endTime: true
            }
          }
        }
      })
      .then((result) => {
        if (result.contest.startTime > now || result.contest.endTime < now) {
          throw new ForbiddenException()
        } else {
          return result.contest.group.id
        }
      })
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
