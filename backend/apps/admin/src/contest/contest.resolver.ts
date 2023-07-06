import {
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'
import { Input } from './input_type/input'
import { InputForDetail } from './input_type/input-for-detail'
import { StoredPublicizingRequestOutput } from './model/stored-publicizing-request.model'

@Resolver(() => Contest)
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [Contest])
  async getContests(@Args('input') input: Input) {
    return await this.contestService.getContests(
      input.take,
      input.groupId,
      input.cursor
    )
  }

  // 협의 필요
  @Query(() => [StoredPublicizingRequestOutput])
  async getPublicRequests(input: Input) {
    return await this.contestService.getPublicRequests(
      input.groupId,
      input.cursor,
      input.take
    )
  }

  @Mutation(() => Contest)
  async createContest(
    @Args('groupId') groupId: number,
    @Args('input') input: Contest
  ) {
    try {
      return await this.contestService.createContest(input)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async updateContest(
    @Args('groupId') groupId: number,
    @Args('input') input: Contest
  ) {
    try {
      return await this.contestService.updateContest(input)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async deleteContest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.deleteContest(groupId, contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async requestToPublic(@Args('input') input: InputForDetail) {
    try {
      return await this.contestService.requestToPublic(
        input.groupId,
        input.itemId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async acceptPublic(@Args('input') input: InputForDetail) {
    try {
      return await this.contestService.acceptPublic(input.groupId, input.itemId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async rejectPublic(@Args('input') input: InputForDetail) {
    try {
      return await this.contestService.rejectPublic(input.groupId, input.itemId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
