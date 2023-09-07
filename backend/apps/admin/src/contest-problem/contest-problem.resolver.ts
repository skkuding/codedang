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
import { ContestProblem } from '@admin/@generated'
import { ContestProblemService } from './contest-problem.service'

@Resolver(() => ContestProblem)
export class ContestProblemResolver {
  private readonly logger = new Logger(ContestProblemResolver.name)
  constructor(private readonly contestProblemService: ContestProblemService) {}

  @Query(() => [ContestProblem], { name: 'contestproblem' })
  async getContestProblems(
    @Args('contestId', { type: () => Int }, ParseIntPipe) contestId: number
  ) {
    try {
      return this.contestProblemService.getContestProblems(contestId)
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

  @Mutation(() => [ContestProblem])
  async updateContestProblemsOrder(
    @Args('contestId', { type: () => Int }, ParseIntPipe) contestId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    try {
      return this.contestProblemService.updateContestProblemsOrder(
        contestId,
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
