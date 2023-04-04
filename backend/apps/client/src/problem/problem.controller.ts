import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common'
import { AuthNotNeeded } from '@client/common/decorator/auth-ignore.decorator'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@client/common/exception/business.exception'
import { GroupMemberGuard } from '@client/group/guard/group-member.guard'
import { RolesGuard } from '@client/user/guard/roles.guard'
import { type PaginationDto } from '../common/dto/pagination.dto'
import { type RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { type RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { type ProblemResponseDto } from './dto/problem.response.dto'
import { type ProblemsResponseDto } from './dto/problems.response.dto'

import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Controller('problem')
@AuthNotNeeded()
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get()
  async getProblems(
    @Query() paginationDto: PaginationDto
  ): Promise<ProblemsResponseDto[]> {
    try {
      return await this.problemService.getProblems(paginationDto)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(
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

@Controller('contest/:contestId/problem')
@AuthNotNeeded()
export class ContestProblemController {
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<RelatedProblemsResponseDto[]> {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        paginationDto
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new ForbiddenException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getContestProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<RelatedProblemResponseDto> {
    try {
      return await this.contestProblemService.getContestProblem(
        contestId,
        problemId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new BadRequestException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest/:contestId/problem')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupContestProblemController {
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<RelatedProblemsResponseDto[]> {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        paginationDto,
        groupId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getContestProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<RelatedProblemResponseDto> {
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

@AuthNotNeeded()
@Controller('workbook/:workbookId/problem')
export class WorkbookProblemController {
  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getWorkbookProblems(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<RelatedProblemsResponseDto[]> {
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

  @Get(':problemId')
  async getWorkbookProblem(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<RelatedProblemResponseDto> {
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

@Controller('group/:groupId/workbook/:workbookId/problem')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupWorkbookProblemController {
  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<RelatedProblemsResponseDto[]> {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        paginationDto,
        groupId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getWorkbookProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<RelatedProblemResponseDto> {
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
