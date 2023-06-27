import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ContestService } from './contest.service'
import { Contest } from '@admin/@generated/contest/contest.model'
import {
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
  ParseIntPipe,
  Req,
  UnprocessableEntityException
} from '@nestjs/common'
import { CursorValidationPipe } from '@admin/common/pipe/cursor-validation.pipe'
import { CreateContestDto } from './dto/create-contest.dto'
import { AuthenticatedRequest } from '@admin/auth/interface/authenticated-request.interface'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  UnprocessableDataException
} from '@admin/common/exception/business.exception'
import { UpdateContestDto } from './dto/update-contest.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'

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

  @Mutation()
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

  @Query()
  async contestPublicizingRequests() {
    try {
      return await this.contestService.getContestPublicizingRequests()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation()
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
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation()
  async createContestPublicizingRequest(
    @Req() req: AuthenticatedRequest,
    @Args('id', ParseIntPipe) contestId: number
  ) {
    try {
      return await this.contestService.createContestPublicizingRequest(
        contestId,
        req.user.id
      )
    } catch (error) {
      if (error instanceof ActionNotAllowedException) {
        throw new MethodNotAllowedException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
