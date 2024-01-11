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
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { AuthNotNeeded, GroupMemberGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { WorkbookProblemService } from './problem.service'

@Controller('workbook/:workbookId/problem')
@AuthNotNeeded()
@UseGuards(GroupMemberGuard)
export class WorkbookProblemController {
  private readonly logger = new Logger(WorkbookProblemController.name)

  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Get()
  async getWorkbookProblems(
    @Param('workbookId', ParseIntPipe) workbookId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', ParseIntPipe) take: number,
    @Query('groupId', IdValidationPipe) groupId: number | null
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblems(
        workbookId,
        cursor,
        take,
        groupId ?? OPEN_SPACE_ID
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
    @Param('problemId', ParseIntPipe) problemId: number,
    @Query('groupId', IdValidationPipe) groupId: number | null
  ) {
    try {
      return await this.workbookProblemService.getWorkbookProblem(
        workbookId,
        problemId,
        groupId ?? OPEN_SPACE_ID
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
