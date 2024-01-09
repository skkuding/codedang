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
import { GroupIdValidationPipe } from 'libs/pipe/src/group-id-validation.pipe'
import { AuthNotNeeded, GroupMemberGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { ContestProblemService } from './problem.service'

@Controller('contest/:contestId/problem')
@AuthNotNeeded()
@UseGuards(GroupMemberGuard)
export class ContestProblemController {
  private readonly logger = new Logger(ContestProblemController.name)

  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Query('groupId', GroupIdValidationPipe) groupId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        cursor,
        take,
        groupId ?? OPEN_SPACE_ID
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
    @Param('problemId', ParseIntPipe) problemId: number,
    @Query('groupId', GroupIdValidationPipe) groupId: number | null
  ) {
    try {
      return await this.contestProblemService.getContestProblem(
        contestId,
        problemId,
        groupId ?? OPEN_SPACE_ID
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
