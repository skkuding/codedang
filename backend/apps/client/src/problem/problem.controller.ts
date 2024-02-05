import {
  Controller,
  DefaultValuePipe,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Query
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe,
  ProblemOrderPipe
} from '@libs/pipe'
import { ProblemOrder } from '@libs/types'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

// import { ProblemOrder } from './schema/problem-order.schema'

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
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('order', ProblemOrderPipe)
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
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('contestId', IDValidationPipe) contestId: number | null,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
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
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
