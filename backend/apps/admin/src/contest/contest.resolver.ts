import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { Problem } from '@admin/@generated'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'
import { CreateContestInput } from './model/contest.input'
import { UpdateContestInput } from './model/contest.input'
import { PublicizingRequest } from './model/publicizing-request.model'

@Resolver(() => Contest)
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [Contest])
  async getContests(
    @Args('take', ParseIntPipe) take: number,
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('cursor', { nullable: true }, CursorValidationPipe) cursor?: number
  ) {
    return await this.contestService.getContests(take, groupId, cursor)
  }

  @Mutation(() => Contest)
  async createContest(
    @Args('input') input: CreateContestInput,
    @Args('groupId', ParseIntPipe) groupId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    try {
      return await this.contestService.createContest(
        groupId,
        req.user.id,
        input
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        console.log(error.message)
        throw new UnprocessableEntityException(error.message)
      }
      console.log(error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  @Mutation(() => Contest)
  async updateContest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('input') input: UpdateContestInput
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

  @Query(() => [PublicizingRequest])
  @UseRolesGuard()
  async getPublicRequests() {
    return await this.contestService.getPublicRequests()
  }

  @Mutation(() => PublicizingRequest)
  async requestToPublic(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.requestToPublic(groupId, contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ActionNotAllowedException) {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  @UseRolesGuard()
  async acceptPublicizingRequest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.acceptPublicizingRequest(
        groupId,
        contestId
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
  async rejectPublicizingRequest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.rejectPublicizingRequest(
        groupId,
        contestId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => [Problem])
  async importGroupProblemsToContest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.importGroupProblemsToContest(
        groupId,
        contestId
      )
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }
}
