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
import { CreateProblemInput } from './model/create-problem.input'
import { GetProblemsInput } from './model/request-problem.input'
import { UpdateProblemInput } from './model/update-problem.input'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => Problem)
  async createProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: CreateProblemInput
  ) {
    try {
      return await this.problemService.createProblem(
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

  @Query(() => Problem)
  async getProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input', { type: () => Int }) input: number
  ) {
    try {
      return await this.problemService.getProblem(groupId, input)
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
  async getProblems(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('cursor', { nullable: true }, CursorValidationPipe) cursor: number,
    @Args('take', { type: () => Int }) take: number,
    @Args('input') input: GetProblemsInput
  ) {
    return await this.problemService.getProblems(groupId, input, cursor, take)
  }

  @Mutation(() => Problem)
  async updateProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    try {
      return await this.problemService.updateProblem(groupId, input)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(err.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Mutation(() => Problem)
  async deleteProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: number
  ) {
    try {
      return await this.problemService.deleteProblem(groupId, input)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(err.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}
