import { Injectable } from '@nestjs/common'
import { ResultStatus } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ForbiddenAccessException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { ProblemRepository } from './problem.repository'

@Injectable()
export class ProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly prisma: PrismaService
  ) {}

  async getProblems(
    cursor: number,
    take: number,
    groupId: number,
    userId?: number
  ) {
    let unprocessedProblems = await this.problemRepository.getProblems(
      cursor,
      take,
      groupId
    )

    if (!userId) {
      unprocessedProblems = unprocessedProblems.filter(
        (problem) => problem.exposeTime <= new Date()
      )
    } else {
      unprocessedProblems = unprocessedProblems.filter(
        (problem) =>
          problem.exposeTime <= new Date() ||
          this.isProblemInUserParticipatingContest(groupId, problem.id)
      )
    }

    const uniqueTagIds = new Set(
      unprocessedProblems.flatMap((item) => {
        return item.problemTag.map((item2) => item2.tagId)
      })
    )
    const tagIds = [...uniqueTagIds]
    const tagList = await this.problemRepository.getProblemsTags(tagIds)

    const problems = unprocessedProblems.map(async (problem) => {
      const { submission, problemTag, ...data } = problem
      const submissionCount = submission.length
      const acceptedRate =
        submission.filter(
          (submission) => submission.result === ResultStatus.Accepted
        ).length / submissionCount
      const problemTags = problemTag.map((tag) => tag.tagId)
      const tags = tagList.filter((tagItem) => problemTags.includes(tagItem.id))
      return {
        ...data,
        submissionCount,
        acceptedRate,
        tags
      }
    })

    return plainToInstance(ProblemsResponseDto, await Promise.all(problems))
  }

  async getProblem(problemId: number, groupId = OPEN_SPACE_ID) {
    const data = await this.problemRepository.getProblem(problemId, groupId)
    return plainToInstance(ProblemResponseDto, data)
  }

  async isProblemInUserParticipatingContest(
    groupId: number,
    problemId: number
  ): Promise<boolean> {
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: {
        problemId
      }
    })
    if (!contestProblems) {
      return false
    }

    const contestIds = contestProblems.map(
      (contestProblem) => contestProblem.contestId
    )

    const contests = await this.prisma.contest.findMany({
      where: {
        id: {
          in: contestIds
        },
        groupId
      }
    })

    if (!contests) {
      return false
    }
    return true
  }
}

@Injectable()
export class ContestProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly contestService: ContestService
  ) {}

  async getContestProblems(
    contestId: number,
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ) {
    if (!(await this.contestService.isVisible(contestId, groupId))) {
      throw new EntityNotExistException('Contest')
    }
    const data = await this.problemRepository.getContestProblems(
      contestId,
      cursor,
      take
    )
    if (data.length > 0 && data[0].contest.startTime > new Date()) {
      throw new ForbiddenAccessException('Contest is not started yet.')
    }
    return plainToInstance(RelatedProblemsResponseDto, data)
  }

  async getContestProblem(
    contestId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ) {
    if (!(await this.contestService.isVisible(contestId, groupId))) {
      throw new EntityNotExistException('Contest')
    }
    const data = await this.problemRepository.getContestProblem(
      contestId,
      problemId
    )
    if (data.contest.startTime > new Date()) {
      throw new ForbiddenAccessException('Contest is not started yet.')
    }
    return plainToInstance(RelatedProblemResponseDto, data)
  }
}

@Injectable()
export class WorkbookProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly workbookService: WorkbookService
  ) {}

  async getWorkbookProblems(
    workbookId: number,
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ) {
    if (!(await this.workbookService.isVisible(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblems(
      workbookId,
      cursor,
      take
    )
    return plainToInstance(RelatedProblemsResponseDto, data)
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ) {
    if (!(await this.workbookService.isVisible(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblem(
      workbookId,
      problemId
    )
    return plainToInstance(RelatedProblemResponseDto, data)
  }
}
