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
import { AuthNotNeeded } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { ProblemService } from './problem.service'

@Controller('problem')
@AuthNotNeeded()
export class ProblemController {
  private readonly logger = new Logger(ProblemController.name)

  constructor(private readonly problemService: ProblemService) {}

  @Get()
  async getProblems(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.problemService.getProblems(cursor, take)
    } catch (err) {
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':problemId')
  async getProblem(@Param('problemId', ParseIntPipe) problemId: number) {
    try {
      return await this.problemService.getProblem(problemId)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      this.logger.error(err.message, err.stack)
      throw new InternalServerErrorException()
    }
  }
}

// TODO: GroupProblemController
