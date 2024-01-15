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
  Query
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
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
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Query('workbookId', IdValidationPipe) workbookId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number,
    @Query('order', new ZodValidationPipe(problemOrderSchema))
    order: ProblemOrder,
    @Query('search') search?: string
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.problemService.getProblems({
          cursor,
          take,
          groupId: groupId ?? OPEN_SPACE_ID,
          order,
          search
        })
      } else if (contestId) {
        return await this.contestProblemService.getContestProblems(
          contestId,
          cursor,
          take,
          groupId ?? OPEN_SPACE_ID
        )
      }
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId!,
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
  async getProblem(
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Query('contestId', IdValidationPipe) contestId: number | null,
    @Query('workbookId', IdValidationPipe) workbookId: number | null,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      if (!contestId && !workbookId) {
        return await this.problemService.getProblem(
          problemId,
          groupId ?? OPEN_SPACE_ID
        )
      } else if (contestId) {
        return await this.contestProblemService.getContestProblem(
          contestId,
          problemId,
          groupId ?? OPEN_SPACE_ID
        )
      }
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId!,
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
