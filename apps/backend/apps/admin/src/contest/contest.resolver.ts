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
import {
  CursorValidationPipe,
  GroupIDPipe,
  IDValidationPipe,
  RequiredIntPipe
} from '@libs/pipe'
import { ContestService } from './contest.service'
import { ContestSubmissionSummaryForUser } from './model/contest-submission-summary-for-user.model'
import { ContestWithParticipants } from './model/contest-with-participants.model'
import { CreateContestInput } from './model/contest.input'
import { UpdateContestInput } from './model/contest.input'
import { ContestsGroupedByStatus } from './model/contests-grouped-by-status'
import { DuplicatedContestResponse } from './model/duplicated-contest-response.output'
import { ProblemScoreInput } from './model/problem-score.input'
import { PublicizingRequest } from './model/publicizing-request.model'
import { PublicizingResponse } from './model/publicizing-response.output'
import {
  UserContestScoreSummary,
  UserContestScoreSummaryWithUserInfo
} from './model/score-summary'

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
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    try {
      return await this.contestService.importProblemsToContest(
        groupId,
        contestId,
        problemIdsWithScore
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

  @Query(() => ContestSubmissionSummaryForUser)
  async getContestSubmissionSummaryByUserId(
    @Args('contestId', { type: () => Int }, IDValidationPipe) contestId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number,
    @Args('problemId', { nullable: true, type: () => Int }, IDValidationPipe)
    problemId: number,
    @Args(
      'take',
      { type: () => Int, defaultValue: 10 },
      new RequiredIntPipe('take')
    )
    take: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null
  ) {
    try {
      return await this.contestService.getContestSubmissionSummaryByUserId(
        take,
        contestId,
        userId,
        problemId,
        cursor
      )
    } catch (error) {
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
        groupId,
        contestId,
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

  @Query(() => UserContestScoreSummary)
  async getContestScoreSummary(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    try {
      return await this.contestService.getContestScoreSummary(userId, contestId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [UserContestScoreSummaryWithUserInfo])
  async getContestScoreSummaries(
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('cursor', { type: () => Int, nullable: true }) cursor: number | null
  ) {
    try {
      return await this.contestService.getContestScoreSummaries(
        take,
        contestId,
        cursor
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => ContestsGroupedByStatus)
  async getContestsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    try {
      return await this.contestService.getContestsByProblemId(problemId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
