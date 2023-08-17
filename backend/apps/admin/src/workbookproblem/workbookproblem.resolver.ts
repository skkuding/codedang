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
import { WorkbookproblemService } from './workbookproblem.service'

@Resolver(() => WorkbookProblem)
export class WorkbookproblemResolver {
  private readonly logger = new Logger(WorkbookproblemResolver.name)
  constructor(
    private readonly workbookproblemService: WorkbookproblemService
  ) {}

  @Query(() => [WorkbookProblem], { name: 'workbookproblem' })
  async getWorkbookProblems(
    @Args('workbookId', { type: () => Int }, ParseIntPipe) workbookId: number
  ) {
    try {
      return this.workbookproblemService.getWorkbookProblems(workbookId)
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
      return this.workbookproblemService.updateWorkbookProblemsOrder(
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
