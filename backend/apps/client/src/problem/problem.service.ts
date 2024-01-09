import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ForbiddenAccessException,
  EntityNotExistException
} from '@libs/exception'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { ProblemRepository } from './problem.repository'
import type { ProblemOrder } from './schema/problem-order.schema'

@Injectable()
export class ProblemService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async getProblems(options: {
    cursor: number | null
    take: number
    groupId: number
    order?: ProblemOrder
    search?: string
  }) {
    let unprocessedProblems = await this.problemRepository.getProblems(options)

    unprocessedProblems = unprocessedProblems.filter(
      (problem) => problem.exposeTime <= new Date()
    )

    const uniqueTagIds = new Set(
      unprocessedProblems.flatMap((item) => {
        return item.problemTag.map((item2) => item2.tagId)
      })
    )
    const tagIds = [...uniqueTagIds]
    const tagList = await this.problemRepository.getProblemsTags(tagIds)

    const problems = unprocessedProblems.map(async (problem) => {
      const { problemTag, ...data } = problem
      const problemTags = problemTag.map((tag) => tag.tagId)
      const tags = tagList.filter((tagItem) => problemTags.includes(tagItem.id))
      return {
        ...data,
        tags
      }
    })

    return plainToInstance(ProblemsResponseDto, await Promise.all(problems))
  }

  async getProblem(problemId: number, groupId = OPEN_SPACE_ID) {
    const data = await this.problemRepository.getProblem(problemId, groupId)
    return plainToInstance(ProblemResponseDto, data)
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
    cursor: number | null,
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
    cursor: number | null,
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
