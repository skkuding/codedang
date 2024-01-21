import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GroupIDPipe } from 'libs/pipe/src/group-id.pipe'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { CursorValidationPipe, ZodValidationPipe } from '@libs/pipe'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'
import { ProblemOrder, problemOrderSchema } from './schema/problem-order.schema'

@Controller('problem')
@AuthNotNeededIfOpenSpace()
export class ProblemController {
  private readonly logger = new Logger(ProblemController.name)

  constructor(
    private readonly problemService: ProblemService,
    private readonly contestProblemService: ContestProblemService,
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getProblems(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Query('workbookId', IdValidationPipe) workbookId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('order', new ZodValidationPipe(problemOrderSchema))
    order: ProblemOrder,
    @Query('search') search?: string
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.problemService.getProblems({
          cursor,
          take,
          groupId,
          order,
          search
        })
      } else if (contestId) {
        return await this.contestProblemService.getContestProblems(
          contestId,
          cursor,
          take,
          groupId
        )
      }
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId!,
        cursor,
        take,
        groupId
      )
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name === 'NotFoundError') ||
        error instanceof EntityNotExistException
      ) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Query('workbookId', IdValidationPipe) workbookId: number | null,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.problemService.getProblem(problemId, groupId)
      } else if (contestId) {
        return await this.contestProblemService.getContestProblem(
          contestId,
          problemId,
          groupId
        )
      }
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId!,
        problemId,
        groupId
      )
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.name === 'NotFoundError') ||
        error instanceof EntityNotExistException
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
