import {
  Controller,
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
import { UseGroupMemberGuardOrNoAuth } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe, ZodValidationPipe } from '@libs/pipe'
import { ProblemService } from './problem.service'
import { ProblemOrder, problemOrderSchema } from './schema/problem-order.schema'

@Controller('problem')
@UseGroupMemberGuardOrNoAuth()
export class ProblemController {
  private readonly logger = new Logger(ProblemController.name)

  constructor(private readonly problemService: ProblemService) {}

  @Get()
  async getProblems(
    @Query('groupId', IdValidationPipe) groupId: number | null,
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
        groupId: groupId ?? OPEN_SPACE_ID,
        order,
        search
      })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Param('problemId', ParseIntPipe) problemId: number
  ) {
    try {
      return await this.problemService.getProblem(
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
