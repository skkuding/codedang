import {
  type CanActivate,
  Injectable,
  type ExecutionContext,
  ForbiddenException
} from '@nestjs/common'
import { OPEN_SPACE_ID } from '@libs/constants'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class PublicProblemSubmissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const problemId: number = parseInt(request.params.problemId)

    const groupId = await this.prisma.problem
      .findFirstOrThrow({
        where: {
          id: problemId
        },
        select: {
          groupId: true
        }
      })
      .then((result) => result.groupId)
      .catch(() => {
        throw new ForbiddenException()
      })

    if (groupId !== OPEN_SPACE_ID) {
      return false
    }

    return true
  }
}
