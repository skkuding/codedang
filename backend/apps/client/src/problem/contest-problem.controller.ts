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
import { Prisma } from '@prisma/client'
import { AuthNotNeeded, GroupMemberGuard } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { ContestProblemService } from './problem.service'

@Controller('contest/:contestId/problem')
@AuthNotNeeded()
export class ContestProblemController {
  private readonly logger = new Logger(ContestProblemController.name)

  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
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
      this.logger.error(err)
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
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name === 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      } else if (err instanceof ForbiddenAccessException) {
        throw new BadRequestException(err.message)
      }
      this.logger.error(err)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/contest/:contestId/problem')
@UseGuards(GroupMemberGuard)
export class GroupContestProblemController {
  private readonly logger = new Logger(GroupContestProblemController.name)

  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
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
      this.logger.error(err)
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
      } else if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name === 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err)
      throw new InternalServerErrorException()
    }
  }
}
