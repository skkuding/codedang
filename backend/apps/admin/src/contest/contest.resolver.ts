import {
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'
import { ContestInput } from './model/contest-input.model'
import { InputForDetail } from './model/input-for-detail.model'
import { Input } from './model/input.model'
import { PublicizingRequest } from './model/publicizing-request.model'

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

  @Query(() => [PublicizingRequest])
  @UseRolesGuard()
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
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: ContestInput
  ) {
    try {
      return await this.contestService.createContest(
        groupId,
        req.user.id,
        input
      )
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
    @Args('input') input: ContestInput
  ) {
    try {
      return await this.contestService.updateContest(groupId, input)
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
  async requestToPublic(
    @Args('groupId') groupId: number,
    @Args('input') input: InputForDetail
  ) {
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
  @UseRolesGuard()
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
  @UseRolesGuard()
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
