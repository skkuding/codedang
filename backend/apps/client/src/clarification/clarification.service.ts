import { Injectable } from '@nestjs/common'
import type { Clarification } from '@prisma/client'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'

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
      throw new EntityNotExistException('Contest')
    }

    return await this.prisma.clarification.findMany({
      where: {
        contestId
      },
      select: {
        id: true,
        problem: {
          select: {
            order: true,
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
      throw new EntityNotExistException('Contest')
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
