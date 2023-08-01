import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common'
import { AuthNotNeeded, RolesGuard, GroupMemberGuard } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Controller('problem')
@AuthNotNeeded()
export class ProblemController {
  private readonly logger = new Logger(ProblemController.name)

  constructor(private readonly problemService: ProblemService) {}

  @Get()
  async getProblems(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.problemService.getProblems(cursor, take)
    } catch (err) {
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(@Param('problemId', ParseIntPipe) problemId: number) {
    try {
      return await this.problemService.getProblem(problemId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('contest/:contestId/problem')
@AuthNotNeeded()
export class ContestProblemController {
  private readonly logger = new Logger(ContestProblemController.name)

  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        cursor,
        take
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new ForbiddenException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getContestProblem(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
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
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest/:contestId/problem')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupContestProblemController {
  private readonly logger = new Logger(GroupContestProblemController.name)

  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        cursor,
        take,
        groupId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getContestProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
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
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}

@AuthNotNeeded()
@Controller('workbook/:workbookId/problem')
export class WorkbookProblemController {
  private readonly logger = new Logger(WorkbookProblemController.name)

  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getWorkbookProblems(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        cursor,
        take
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getWorkbookProblem(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId,
        problemId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/workbook/:workbookId/problem')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupWorkbookProblemController {
  private readonly logger = new Logger(GroupWorkbookProblemController.name)

  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        cursor,
        take,
        groupId
      )
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getWorkbookProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
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
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}
