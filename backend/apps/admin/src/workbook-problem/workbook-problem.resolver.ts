import {
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ParseArrayPipe,
  ParseIntPipe,
  UnprocessableEntityException
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { WorkbookProblem } from '@admin/@generated'
import { WorkbookProblemService } from './workbook-problem.service'

@Resolver(() => WorkbookProblem)
export class WorkbookProblemResolver {
  private readonly logger = new Logger(WorkbookProblemResolver.name)
  constructor(
    private readonly workbookProblemService: WorkbookProblemService
  ) {}

  @Query(() => [WorkbookProblem], { name: 'workbookproblem' })
  async getWorkbookProblems(
    @Args('workbookId', { type: () => Int }, ParseIntPipe) workbookId: number
  ) {
    try {
      return this.workbookProblemService.getWorkbookProblems(workbookId)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      } else if (error.code == 'P2025') {
        throw new EntityNotExistException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException(error.message)
    }
  }

  @Mutation(() => [WorkbookProblem])
  async updateWorkbookProblemsOrder(
    @Args('workbookId', { type: () => Int }, ParseIntPipe) workbookId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    try {
      return this.workbookProblemService.updateWorkbookProblemsOrder(
        workbookId,
        orders
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      } else if (error.code == 'P2025') {
        throw new EntityNotExistException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException(error.message)
    }
  }
}
