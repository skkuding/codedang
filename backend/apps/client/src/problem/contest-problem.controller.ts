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
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new BadRequestException(error.message)
      }
      this.logger.error(error)
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
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
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
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
