import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { PUBLIC_GROUP_ID } from 'src/common/contstants'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { ContestService } from 'src/contest/contest.service'
import { WorkbookService } from 'src/workbook/workbook.service'
import { ContestProblemResponseDto } from './dto/contest-problem.response.dto'
import { ContestProblemsResponseDto } from './dto/contest-problems.response.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { WorkbookProblemResponseDto } from './dto/workbook-problem.response.dto'
import { WorkbookProblemsResponseDto } from './dto/workbook-problems.response.dto'
import { ProblemRepository } from './problem.repository'

/**
 * TODO: 사용하는 service별로 class를 분리합니다
 */
@Injectable()
export class ProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository //, private readonly contestService: ContestService, // private readonly workbookService: WorkbookService
  ) {}

  async getProblem(problemId: number): Promise<ProblemResponseDto> {
    const data = await this.problemRepository.getProblem(problemId)
    console.log(data)
    return plainToInstance(ProblemResponseDto, data)
  }

  async getProblems(
    paginationDto: PaginationDto
  ): Promise<ProblemsResponseDto[]> {
    const data = await this.problemRepository.getProblems(paginationDto)
    return plainToInstance(ProblemsResponseDto, data)
  }
}

@Injectable()
export class ContestProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly contestService: ContestService
  ) {}

  private async isVisibleContest(
    contestId: number,
    groupId?: number
  ): Promise<boolean> {
    if (groupId === PUBLIC_GROUP_ID)
      return await this.contestService.isPublicAndVisibleContest(contestId)
    else
      return await this.contestService.isVisibleContestOfGroup(
        groupId,
        contestId
      )
  }

  async getContestProblems(
    contestId: number,
    paginationDto: PaginationDto,
    groupId = PUBLIC_GROUP_ID
  ): Promise<ContestProblemsResponseDto[]> {
    if (!(await this.isVisibleContest(contestId, groupId))) {
      throw new EntityNotExistException('Contest')
    }
    const data = await this.problemRepository.getContestProblems(
      contestId,
      paginationDto
    )
    return plainToInstance(ContestProblemsResponseDto, data)
  }

  async getContestProblem(
    contestId: number,
    problemId: number,
    groupId = PUBLIC_GROUP_ID
  ): Promise<ContestProblemResponseDto> {
    if (!(await this.isVisibleContest(contestId, groupId))) {
      throw new EntityNotExistException('Contest')
    }
    const data = await this.problemRepository.getContestProblem(
      contestId,
      problemId
    )
    return plainToInstance(ContestProblemResponseDto, data)
  }
}

@Injectable()
export class WorkbookProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly workbookService: WorkbookService
  ) {}

  private async isVisibleWorkbook(
    workbookId: number,
    groupId: number
  ): Promise<boolean> {
    if (groupId === PUBLIC_GROUP_ID)
      return await this.workbookService.isPublicAndVisibleWorkbook(workbookId)
    else
      return await this.workbookService.isVisibleWorkbookOfGroup(
        groupId,
        workbookId
      )
  }

  async getWorkbookProblems(
    workbookId: number,
    paginationDto: PaginationDto,
    groupId = PUBLIC_GROUP_ID
  ): Promise<WorkbookProblemResponseDto[]> {
    if (!(await this.isVisibleWorkbook(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblems(
      workbookId,
      paginationDto
    )
    return plainToInstance(WorkbookProblemsResponseDto, data)
  }

  async getWorkbookProblem(
    workbookId: number,
    problemId: number,
    groupId = PUBLIC_GROUP_ID
  ): Promise<WorkbookProblemResponseDto> {
    if (!(await this.isVisibleWorkbook(workbookId, groupId))) {
      throw new EntityNotExistException('Workbook')
    }
    const data = await this.problemRepository.getWorkbookProblem(
      workbookId,
      problemId
    )
    return plainToInstance(WorkbookProblemResponseDto, data)
  }
}
