import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ParseBoolPipe,
  ParseIntPipe,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { ContestProblem } from '@admin/@generated'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'
import { CreateContestInput } from './model/contest.input'
import { UpdateContestInput } from './model/contest.input'
import { PublicizingRequest } from './model/publicizing-request.model'
import { PublicizingResponse } from './model/publicizing-response.output'

@Resolver(() => Contest)
export class ContestResolver {
  private readonly logger = new Logger(ContestResolver.name)
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [Contest])
  async getContests(
    @Args('take', ParseIntPipe) take: number,
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    return await this.contestService.getContests(take, groupId, cursor)
  }

  @Mutation(() => Contest)
  async createContest(
    @Args('input') input: CreateContestInput,
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
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
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
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
      this.logger.error(error)
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
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [PublicizingRequest])
  @UseRolesGuard()
  async getPublicizingRequests() {
    return await this.contestService.getPublicizingRequests()
  }

  @Mutation(() => PublicizingRequest)
  async createPublicizingRequest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.createPublicizingRequest(
        groupId,
        contestId
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new BadRequestException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => PublicizingResponse)
  @UseRolesGuard()
  async handlePublicizingRequest(
    @Args('contestId', ParseIntPipe) contestId: number,
    @Args('isAccepted', ParseBoolPipe) isAccepted: boolean
  ) {
    try {
      return await this.contestService.handlePublicizingRequest(
        contestId,
        isAccepted
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => [ContestProblem])
  async importProblemsToContest(
    @Args('groupId', ParseIntPipe) groupId: number,
    @Args('contestId', ParseIntPipe) contestId: number,
    @Args('problemIds', { type: () => [Int] }) problemIds: number[]
  ) {
    try {
      return await this.contestService.importProblemsToContest(
        groupId,
        contestId,
        problemIds
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
