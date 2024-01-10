import {
  Controller,
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
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe, ZodValidationPipe } from '@libs/pipe'
import { ProblemService } from './problem.service'
import { ProblemOrder, problemOrderSchema } from './schema/problem-order.schema'

@Controller('problem')
@AuthNotNeeded()
export class ProblemController {
  private readonly logger = new Logger(ProblemController.name)

  constructor(private readonly problemService: ProblemService) {}
  @Get()
  async getProblems(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number,
    @Query('order', new ZodValidationPipe(problemOrderSchema))
    order: ProblemOrder,
    @Query('search') search?: string
  ) {
    try {
      return await this.problemService.getProblems({
        cursor,
        take,
        search,
        order,
        groupId: OPEN_SPACE_ID
      })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(@Param('problemId', ParseIntPipe) problemId: number) {
    try {
      return await this.problemService.getProblem(problemId)
    } catch (error) {
      if (
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

@Controller('group/:groupId/problem')
@UseGuards(GroupMemberGuard)
export class GroupProblemController {
  private readonly logger = new Logger(GroupProblemController.name)

  constructor(private readonly problemService: ProblemService) {}

  @Get()
  async getProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.problemService.getProblems({ cursor, take, groupId })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.problemService.getProblem(problemId, groupId)
    } catch (error) {
      if (
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
