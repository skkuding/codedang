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
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { WorkbookProblemService } from './problem.service'

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
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        cursor,
        take
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
  async getWorkbookProblem(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId,
        problemId
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

@Controller('group/:groupId/workbook/:workbookId/problem')
@UseGuards(GroupMemberGuard)
export class GroupWorkbookProblemController {
  private readonly logger = new Logger(GroupWorkbookProblemController.name)

  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getWorkbookProblems(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
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
