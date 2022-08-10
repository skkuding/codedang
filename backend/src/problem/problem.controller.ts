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
import { PaginationDto } from '../common/dto/pagination.dto'
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
import { ProblemService } from './problem.service'

@Public()
@Controller()
export class PublicProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('problem/:id')
  async getPublicProblem(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PublicProblemResponseDto> {
    try {
      return await this.problemService.getPublicProblem(id)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get('problems')
  async getPublicProblems(
    @Query() paginationDto: PaginationDto
  ): Promise<PublicProblemsResponseDto[]> {
    try {
      return await this.problemService.getPublicProblems(paginationDto)
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@Public()
@Controller('contest')
export class PublicContestProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':contestId/problem/:problemId')
  async getPublicContestProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<PublicContestProblemResponseDto> {
    try {
      return await this.problemService.getPublicContestProblem(
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

  @Get(':contestId/problems')
  async getPublicContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<PublicContestProblemsResponseDto[]> {
    try {
      return await this.problemService.getPublicContestProblems(
        contestId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@Public()
@Controller('workbook')
export class PublicWorkbookProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':workbookId/problem/:problemId')
  async getPublicWorkbookProblem(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<PublicWorkbookProblemResponseDto> {
    try {
      return await this.problemService.getPublicWorkbookProblem(
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

  @Get(':workbookId/problems')
  async getPublicWorkbookProblems(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<PublicWorkbookProblemsResponseDto[]> {
    try {
      return await this.problemService.getPublicWorkbookProblems(
        workbookId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@UseGuards(GroupMemberGuard)
@Controller('group')
export class GroupContestProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':groupId/contest/:contestId/problem/:problemId')
  async getGroupContestProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<ContestProblemResponseDto> {
    try {
      return await this.problemService.getGroupContestProblem(
        groupId,
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

  @Get(':groupId/contest/:contestId/problems')
  async getGroupContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<ContestProblemsResponseDto[]> {
    try {
      return await this.problemService.getGroupContestProblems(
        groupId,
        contestId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}

@UseGuards(GroupMemberGuard)
@Controller('group')
export class GroupWorkbookProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get(':groupId/workbook/:workbookId/problem/:problemId')
  async getGroupWorkbookProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ): Promise<WorkbookProblemResponseDto> {
    try {
      return await this.problemService.getGroupWorkbookProblem(
        groupId,
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

  @Get(':groupId/workbook/:workbookId/problems')
  async getGroupWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<WorkbookProblemsResponseDto[]> {
    try {
      return await this.problemService.getGroupWorkbookProblems(
        groupId,
        workbookId,
        paginationDto
      )
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}
