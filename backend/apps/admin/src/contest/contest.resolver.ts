import {
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
  ParseIntPipe,
  Req,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import { UpdateContestDto } from './dto/update-contest.dto'
import { ContestPublicizingRequest } from './model/contest-publicizing-request.model'
import { RespondContestPublicizingRequest as OutputTypeRespondcontestPublicizingRequestDto } from './model/respond-contest-publicizing-request.model'
import { StoredPublicizingRequestOutput } from './model/stored-publicizing-request.model'

@Resolver(() => Contest)
export class ContestResolver {
  constructor(private readonly contestService: ContestService) {}

  @Query(() => [Contest])
  async adminContests(
    @Args('cursor', CursorValidationPipe) cursor: number,
    @Args('take', ParseIntPipe) take: number,
    @Args('groupId') groupId?: number
  ) {
    if (!groupId) {
      return await this.contestService.getAdminContests(cursor, take)
    } else {
      return await this.contestService.getAdminContests(cursor, take, groupId)
    }
  }

  @Query(() => [Contest])
  async adminOngoingContests(
    @Args('cursor', CursorValidationPipe) cursor: number,
    @Args('take', ParseIntPipe) take: number
  ) {
    return await this.contestService.getAdminOngoingContests(cursor, take)
  }

  @Mutation(() => Contest)
  async createContest(
    @Req() req: AuthenticatedRequest,
    @Args('contestDto') contestDto: CreateContestDto
  ) {
    try {
      return await this.contestService.createContest(contestDto, req.user.id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Contest)
  async updateContest(
    @Args('id', ParseIntPipe) id: number,
    @Args('contestDto') contestDto: UpdateContestDto
  ) {
    try {
      return await this.contestService.updateContest(id, contestDto)
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
  async deleteContest(@Args('id', ParseIntPipe) id: number) {
    try {
      return await this.contestService.deleteContest(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => Contest)
  async adminContest(@Args('id', ParseIntPipe) id: number) {
    try {
      return await this.contestService.getAdminContest(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [StoredPublicizingRequestOutput])
  async contestPublicizingRequests() {
    try {
      return await this.contestService.getContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => OutputTypeRespondcontestPublicizingRequestDto)
  async respondContestPublicizingRequest(
    @Args('id', ParseIntPipe) contestId: number,
    @Args('respondContestPublicizingRequestDto')
    respondContestPublicizingRequestDto: RespondContestPublicizingRequestDto
  ) {
    try {
      await this.contestService.respondContestPublicizingRequest(
        contestId,
        respondContestPublicizingRequestDto
      )
      return respondContestPublicizingRequestDto
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => ContestPublicizingRequest)
  async createContestPublicizingRequest(
    @Req() req: AuthenticatedRequest,
    @Args('id', ParseIntPipe) contestId: number
  ) {
    try {
      await this.contestService.createContestPublicizingRequest(
        contestId,
        req.user.id
      )
      return {
        userId: req.user.id,
        contestId: contestId
      }
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
