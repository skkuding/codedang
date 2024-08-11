import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ParseBoolPipe
} from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Contest, ContestProblem } from '@generated'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { ContestService } from './contest.service'
import { ContestWithParticipants } from './model/contest-with-participants.model'
import { CreateContestInput } from './model/contest.input'
import { UpdateContestInput } from './model/contest.input'
import { DuplicatedContestResponse } from './model/duplicated-contest-response.output'
import { PublicizingRequest } from './model/publicizing-request.model'
import { PublicizingResponse } from './model/publicizing-response.output'

@Resolver(() => Contest)
export class ContestResolver {
  private readonly logger = new Logger(ContestResolver.name)
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [ContestWithParticipants])
  async getContests(
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    return await this.contestService.getContests(take, groupId, cursor)
  }

  @Query(() => ContestWithParticipants)
  async getContest(
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    try {
      return await this.contestService.getContest(contestId)
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new NotFoundException(error.message)
      }
    }
  }

  @Mutation(() => Contest)
  async createContest(
    @Args('input') input: CreateContestInput,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
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
      if (
        error instanceof UnprocessableDataException ||
        error instanceof EntityNotExistException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async updateContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('input') input: UpdateContestInput
  ) {
    try {
      return await this.contestService.updateContest(groupId, input)
    } catch (error) {
      if (
        error instanceof EntityNotExistException ||
        error instanceof UnprocessableDataException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async deleteContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    try {
      return await this.contestService.deleteContest(groupId, contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
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
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    try {
      return await this.contestService.createPublicizingRequest(
        groupId,
        contestId
      )
    } catch (error) {
      if (
        error instanceof EntityNotExistException ||
        error instanceof ConflictFoundException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => PublicizingResponse)
  @UseRolesGuard()
  async handlePublicizingRequest(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('isAccepted', ParseBoolPipe) isAccepted: boolean
  ) {
    try {
      return await this.contestService.handlePublicizingRequest(
        contestId,
        isAccepted
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => [ContestProblem])
  async importProblemsToContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number,
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
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => [ContestProblem])
  async removeProblemsFromContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int })
    contestId: number,
    @Args('problemIds', { type: () => [Int] }) problemIds: number[]
  ) {
    try {
      return await this.contestService.removeProblemsFromContest(
        groupId,
        contestId,
        problemIds
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => DuplicatedContestResponse)
  async duplicateContest(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int })
    contestId: number,
    @Context('req') req: AuthenticatedRequest
  ) {
    try {
      return await this.contestService.duplicateContest(
        contestId,
        groupId,
        req.user.id
      )
    } catch (error) {
      if (
        error instanceof UnprocessableDataException ||
        error instanceof EntityNotExistException
      ) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
