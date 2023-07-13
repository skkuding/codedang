import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe
} from '@nestjs/common'
import { Resolver, Mutation, Args, Query, Context, Int } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { Problem } from '@admin/@generated/problem/problem.model'
import { CreateGroupProblemInput } from './model/create-problem.input'
import { GetGroupProblemsInput } from './model/request-problem.input'
import { UpdateProblemInput } from './model/update-problem.input'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Query(() => Problem)
  async getProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input', { type: () => Int }) input: number
  ) {
    try {
      return await this.problemService.getGroupProblem(groupId, input)
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code == 'P2003'
      ) {
        throw new UnprocessableDataException(err.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Query(() => [Problem])
  async getGroupProblems(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('cursor', { nullable: true }, CursorValidationPipe) cursor: number,
    @Args('take', { type: () => Int }) take: number,
    @Args('input') input: GetGroupProblemsInput
  ) {
    return await this.problemService.getGroupProblems(
      groupId,
      cursor,
      take,
      input
    )
  }

  @Mutation(() => Problem)
  async createGroupProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input')
    input: CreateGroupProblemInput
  ) {
    try {
      return await this.problemService.createGroupProblem(
        req.user.id,
        groupId,
        input
      )
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(err.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Mutation(() => Problem)
  async deleteGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input')
    input: number
  ) {
    try {
      return await this.problemService.deleteGroupProblem(groupId, input)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(err.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Mutation(() => Problem)
  async updateGroupProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    try {
      return await this.problemService.updateGroupProblem(groupId, input)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(err.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}
