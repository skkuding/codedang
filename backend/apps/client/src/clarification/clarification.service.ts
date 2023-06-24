import { OPEN_SPACE_ID } from '@client/common/constants'
import { EntityNotExistException } from '@client/common/exception/business.exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'
import { Injectable } from '@nestjs/common'
import { type Clarification } from '@prisma/client'

@Injectable()
export class ClarificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService
  ) {}

  async getClarificationsByContest(
    contestId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Clarification>[]> {
    if (!(await this.contestService.isVisible(contestId, groupId))) {
      throw new EntityNotExistException('contest')
    }

    return await this.prisma.clarification.findMany({
      where: {
        contestId
      },
      select: {
        id: true,
        problem: {
          select: {
            id: true,
            problemId: true
          }
        },
        content: true,
        updateTime: true
      }
    })
  }

  async getClarificationsByProblem(
    contestId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Clarification>[]> {
    if (!(await this.contestService.isVisible(contestId, groupId))) {
      throw new EntityNotExistException('contest')
    }

    return await this.prisma.clarification.findMany({
      where: {
        contestId,
        problemId
      },
      select: {
        id: true,
        content: true,
        updateTime: true
      }
    })
  }
}
