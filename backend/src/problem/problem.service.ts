import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { ContestService } from 'src/contest/contest.service'
import { WorkbookService } from 'src/workbook/workbook.service'
import { ContestProblemResponseDto } from './dto/contest-problem.response.dto'
import { ContestProblemsResponseDto } from './dto/contest-problems.response.dto'
import { PublicContestProblemResponseDto } from './dto/public-contest-problem.response.dto'
import { PublicContestProblemsResponseDto } from './dto/public-contest-problems.response.dto'
import { PublicProblemResponseDto } from './dto/public-problem.response.dto'
import { PublicProblemsResponseDto } from './dto/public-problems.response.dto'
import { PublicWorkbookProblemResponseDto } from './dto/public-workbook-problem.response.dto'
import { PublicWorkbookProblemsResponseDto } from './dto/public-workbook-problems.response.dto'
import { WorkbookProblemResponseDto } from './dto/workbook-problem.response.dto'
import { WorkbookProblemsResponseDto } from './dto/workbook-problems.response.dto'
import { ProblemRepository } from './problem.repository'

/**
 * TODO: ResponseDto를 정의하고 calss-transformer를 활용하여 필드를 선택하거나 변형하여 반환합니다
 * TODO: 사용하는 service별로 class를 분리합니다
 */
@Injectable()
export class ProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly contestService: ContestService,
    private readonly workbookService: WorkbookService
  ) {}

  async getPublicProblem(problemId: number): Promise<PublicProblemResponseDto> {
    // group_id=PUBLIC_GROUP_ID이고 problem의 is_public=true 인 problem을 반환
    return plainToInstance(
      PublicProblemResponseDto,
      await this.problemRepository.getPublicProblem(problemId)
    )
  }

  async getPublicProblems(
    paginationDto: PaginationDto
  ): Promise<PublicProblemsResponseDto[]> {
    // group_id=PUBLIC_GROUP_ID이고 problemd의 is_public=true 인 problem 배열을 반환
    const data = await this.problemRepository.getPublicProblems(paginationDto)
    return plainToInstance(PublicProblemsResponseDto, data)
  }

  async getPublicContestProblem(
    contestId: number,
    problemId: number
  ): Promise<PublicContestProblemResponseDto> {
    // contest가 visible=false이거나 is_public=false 인 경우 throw error
    if (!(await this.isPublicAndVisibleContest(contestId))) {
      throw new EntityNotExistException('Contest')
    }
    // problem이 id=problemId이고, Contest에 등록된 problem을 반환
    const data = await this.problemRepository.getProblemOfContest(
      contestId,
      problemId
    )
    return plainToInstance(PublicContestProblemResponseDto, data)
  }

  private async isPublicAndVisibleContest(contestId: number): Promise<boolean> {
    return await this.contestService.isPublicAndVisibleContest(contestId)
  }

  // TODO: 범용적으로 사용 가능하도록 수정. 복사해서 새로운 object 반환하는 형태로 수정
  private transformDisplayId(entity: any, relationTable: string) {
    entity['displayId'] = entity[relationTable][0].display_id
    return entity
  }

  private transformDisplayIdFromArray(entities: any, relationTable: string) {
    return entities.map((entity) =>
      this.transformDisplayId(entity, relationTable)
    )
  }

  async getPublicContestProblems(
    contestId: number,
    paginationDto: PaginationDto
  ): Promise<PublicContestProblemsResponseDto[]> {
    // contest가 visible=false이거나 is_public=false 인 경우 throw error
    if (!(await this.isPublicAndVisibleContest(contestId))) {
      throw new EntityNotExistException('Contest')
    }
    // Contest에 등록된 problem들을 반환
    const data = await this.problemRepository.getProblemsOfContest(
      contestId,
      paginationDto
    )
    return plainToInstance(PublicContestProblemsResponseDto, data)
  }

  async getPublicWorkbookProblem(
    workbookId: number,
    problemId: number
  ): Promise<PublicWorkbookProblemResponseDto> {
    // workbook이 visible=false이거나 is_public=false 인 경우 throw error
    if (!(await this.isPublicAndVisibleWorkbook(workbookId))) {
      throw new EntityNotExistException('Workbook')
    }
    // problem이 id=problemId이고, Workbook에 등록된 problem을 반환
    const data = await this.problemRepository.getProblemOfWorkbook(
      workbookId,
      problemId
    )
    return plainToInstance(PublicWorkbookProblemResponseDto, data)
  }

  private async isPublicAndVisibleWorkbook(
    workbookId: number
  ): Promise<boolean> {
    return await this.workbookService.isPublicAndVisibleWorkbook(workbookId)
  }

  async getPublicWorkbookProblems(
    workbookId: number,
    paginationDto: PaginationDto
  ): Promise<PublicWorkbookProblemsResponseDto[]> {
    // workbook이 visible=false이거나 is_public=false 인 경우 throw error
    if (!(await this.isPublicAndVisibleWorkbook(workbookId))) {
      throw new EntityNotExistException('Contest')
    }
    // Workbook에 등록된 problem들을 반환
    const data = await this.problemRepository.getProblemsOfWorkbook(
      workbookId,
      paginationDto
    )
    return plainToInstance(PublicWorkbookProblemsResponseDto, data)
  }

  async getGroupContestProblem(
    groupId: number,
    contestId: number,
    problemId: number
  ): Promise<ContestProblemResponseDto> {
    // contest가 visible=false이거나 group의 contest가 아닌 경우 throw error
    if (!(await this.isVisibleContestOfGroup(groupId, contestId))) {
      throw new EntityNotExistException('Contest')
    }
    // problem이 id=problemId이고, Contest에 등록된 problem을 반환
    const data = await this.problemRepository.getProblemOfContest(
      contestId,
      problemId
    )
    return plainToInstance(
      ContestProblemResponseDto,
      this.transformDisplayId(data, 'ContestProblem')
    )
  }

  private async isVisibleContestOfGroup(
    groupId: number,
    contestId: number
  ): Promise<boolean> {
    return await this.contestService.isVisibleContestOfGroup(groupId, contestId)
  }

  async getGroupContestProblems(
    groupId: number,
    contestId: number,
    paginationDto: PaginationDto
  ): Promise<ContestProblemsResponseDto[]> {
    // contest가 visible=false이거나 group의 contest가 아닌 경우 throw error
    if (!(await this.isVisibleContestOfGroup(groupId, contestId))) {
      throw new EntityNotExistException('Contest')
    }
    // Contest에 등록된 problem들을 반환
    const data = await this.problemRepository.getProblemsOfContest(
      contestId,
      paginationDto
    )
    return plainToInstance(ContestProblemsResponseDto, data)
  }

  async getGroupWorkbookProblem(
    groupId: number,
    workbookId: number,
    problemId: number
  ): Promise<WorkbookProblemResponseDto> {
    // workbook이 visible=false이거나 group의 workbook이 아닌 경우 throw error
    if (!(await this.isVisibleWorkbookOfGroup(groupId, workbookId))) {
      throw new EntityNotExistException('Workbook')
    }
    // problem이 id=problemId이고, Workbook에 등록된 problem을 반환
    const data = await this.problemRepository.getProblemOfWorkbook(
      workbookId,
      problemId
    )
    return plainToInstance(WorkbookProblemResponseDto, data)
  }

  private async isVisibleWorkbookOfGroup(
    groupId: number,
    contestId: number
  ): Promise<boolean> {
    return await this.workbookService.isVisibleWorkbookOfGroup(
      groupId,
      contestId
    )
  }

  async getGroupWorkbookProblems(
    groupId: number,
    workbookId: number,
    paginationDto: PaginationDto
  ): Promise<WorkbookProblemsResponseDto[]> {
    // workbook이 visible=false이거나 group의 workbook이 아닌 경우 throw error
    if (!(await this.isVisibleWorkbookOfGroup(groupId, workbookId))) {
      throw new EntityNotExistException('Workbook')
    }
    // Workbook에 등록된 problem들을 반환
    const data = await this.problemRepository.getProblemsOfWorkbook(
      workbookId,
      paginationDto
    )
    return plainToInstance(WorkbookProblemsResponseDto, data)
  }
}
