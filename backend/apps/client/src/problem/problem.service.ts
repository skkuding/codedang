import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { OPEN_SPACE_ID } from '@client/common/constants'
import { type PaginationDto } from '@client/common/dto/pagination.dto'
import {
  ForbiddenAccessException,
  EntityNotExistException
} from '@client/common/exception/business.exception'
import { ContestService } from '@client/contest/contest.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { ProblemRepository } from './problem.repository'

@Injectable()
export class ProblemService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async getProblems(
    paginationDto: PaginationDto
  ): Promise<ProblemsResponseDto[]> {
    const data = await this.problemRepository.getProblems(paginationDto)
    return plainToInstance(ProblemsResponseDto, data)
  }

  async getProblem(
    problemId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<ProblemResponseDto> {
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
    paginationDto: PaginationDto,
    groupId = OPEN_SPACE_ID
  ): Promise<RelatedProblemsResponseDto[]> {
    if (!(await this.contestService.isVisible(contestId, groupId))) {
      throw new EntityNotExistException('Contest')
    }
    const data = await this.problemRepository.getContestProblems(
      contestId,
      paginationDto
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
  ): Promise<RelatedProblemResponseDto> {
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
    paginationDto: PaginationDto,
    groupId = OPEN_SPACE_ID
  ): Promise<RelatedProblemsResponseDto[]> {
    if (!(await this.workbookService.isVisible(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblems(
      workbookId,
      paginationDto
    )
    return plainToInstance(RelatedProblemsResponseDto, data)
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<RelatedProblemResponseDto> {
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
