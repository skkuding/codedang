import {
  Controller,
  DefaultValuePipe,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Query,
  Req
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  AuthNotNeededIfOpenSpace,
  UserNullWhenAuthFailedIfOpenSpace,
  type AuthenticatedRequest
} from '@libs/auth'
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
import { ProblemOrder } from './enum/problem-order.enum'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Controller('problem')
export class ProblemController {
  private readonly logger = new Logger(ProblemController.name)

  constructor(
    private readonly problemService: ProblemService,
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  @UserNullWhenAuthFailedIfOpenSpace()
  async getProblems(
    @Req() req: AuthenticatedRequest,
    @Query('groupId', GroupIDPipe)
    groupId: number,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('order', ProblemOrderPipe)
    order: ProblemOrder,
    @Query('search') search?: string
  ) {
    try {
      if (!workbookId) {
        return await this.problemService.getProblems({
          userId: req.user?.id ?? null,
          cursor,
          take,
          groupId,
          order,
          search
        })
      }
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId!,
        cursor,
        take,
        groupId
      )
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

  @Get(':problemId')
  @AuthNotNeededIfOpenSpace()
  async getProblem(
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('workbookId', IDValidationPipe) workbookId: number | null,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number
  ) {
    try {
      if (!workbookId) {
        return await this.problemService.getProblem(problemId, groupId)
      }
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId!,
        problemId,
        groupId
      )
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

@Controller('contest/:contestId/problem')
export class ContestProblemController {
  private readonly logger = new Logger(ContestProblemController.name)

  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Get()
  async getContestProblems(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Query('groupId', GroupIDPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number
  ) {
    try {
      return await this.contestProblemService.getContestProblems(
        contestId,
        req.user.id,
        cursor,
        take,
        groupId
      )
    } catch (error) {
      if (
        error instanceof EntityNotExistException ||
        error instanceof ForbiddenAccessException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getContestProblem(
    @Req() req: AuthenticatedRequest,
    @Param('contestId', IDValidationPipe) contestId: number,
    @Param('problemId', new RequiredIntPipe('problemId')) problemId: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.contestProblemService.getContestProblem(
        contestId,
        problemId,
        req.user.id,
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
