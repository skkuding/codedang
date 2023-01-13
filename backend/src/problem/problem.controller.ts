import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common'
import { Public } from 'src/common/decorator/public.decorator'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { PaginationDto } from '../common/dto/pagination.dto'
import { ContestProblemResponseDto } from './dto/contest-problem.response.dto'
import { ContestProblemsResponseDto } from './dto/contest-problems.response.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { WorkbookProblemResponseDto } from './dto/workbook-problem.response.dto'
import { WorkbookProblemsResponseDto } from './dto/workbook-problems.response.dto'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Public()
@Controller('problem')
export class PublicProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get()
  async getPublicProblems(
    @Query() paginationDto: PaginationDto
  ): Promise<ProblemsResponseDto[]> {
    try {
      return await this.problemService.getProblems(paginationDto)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getPublicProblem(
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<ProblemResponseDto> {
    try {
      return await this.problemService.getProblem(problemId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Public()
@Controller('contest')
export class PublicContestProblemController {
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get(':contestId/problem')
  async getPublicContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<ContestProblemsResponseDto[]> {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':contestId/problem/:problemId')
  async getPublicContestProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<ContestProblemResponseDto> {
    try {
      return await this.contestProblemService.getContestProblem(
        contestId,
        problemId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Public()
@Controller('workbook')
export class PublicWorkbookProblemController {
  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get(':workbookId/problem')
  async getPublicWorkbookProblems(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<WorkbookProblemsResponseDto[]> {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        paginationDto
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':workbookId/problem/:problemId')
  async getPublicWorkbookProblem(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<WorkbookProblemResponseDto> {
    try {
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId,
        problemId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@UseGuards(RolesGuard, GroupMemberGuard)
@Controller('group')
export class GroupContestProblemController {
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get(':groupId/contest/:contestId/problem')
  async getGroupContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<ContestProblemsResponseDto[]> {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        paginationDto,
        groupId
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/contest/:contestId/problem/:problemId')
  async getGroupContestProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<ContestProblemResponseDto> {
    try {
      return await this.contestProblemService.getContestProblem(
        contestId,
        problemId,
        groupId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@UseGuards(RolesGuard, GroupMemberGuard)
@Controller('group')
export class GroupWorkbookProblemController {
  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get(':groupId/workbook/:workbookId/problem')
  async getGroupWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<WorkbookProblemsResponseDto[]> {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        paginationDto,
        groupId
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':groupId/workbook/:workbookId/problem/:problemId')
  async getGroupWorkbookProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<WorkbookProblemResponseDto> {
    try {
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId,
        problemId,
        groupId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
