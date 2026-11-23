import { Injectable } from '@nestjs/common'
import type { AuthenticatedUser } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'

@Injectable()
export class BlueprintAssignmentProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blueprintAccessService: BlueprintAccessService
  ) {}

  async getBlueprintAssignmentProblems(
    user: AuthenticatedUser,
    blueprintAssignmentId: number
  ) {
    await this.assertAccess(user, blueprintAssignmentId)

    return await this.prisma.blueprintAssignmentProblem.findMany({
      where: { blueprintAssignmentId },
      orderBy: { order: 'asc' }
    })
  }

  private async assertAccess(
    user: AuthenticatedUser,
    blueprintAssignmentId: number
  ) {
    const blueprintAssignment =
      await this.prisma.blueprintAssignment.findUnique({
        where: { id: blueprintAssignmentId },
        select: { blueprintCourseId: true }
      })
    if (!blueprintAssignment) {
      throw new EntityNotExistException('BlueprintAssignment')
    }
    await this.blueprintAccessService.assertBlueprintLeader(
      user,
      blueprintAssignment.blueprintCourseId
    )
  }
}
