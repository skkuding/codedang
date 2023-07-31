import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ParseIntPipe,
  UnprocessableEntityException
} from '@nestjs/common'
import { Args, Context, Query, Int, Mutation, Resolver } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  InvalidFileFormatException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { Problem } from '@admin/@generated'
import { CreateProblemInput } from './model/create-problem.input'
import { FilterProblemsInput } from './model/filter-problem.input'
import { FileUploadInput } from './model/problem.input'
import { FileUploadOutput } from './model/problem.output'
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
        input,
        req.user.id,
        groupId
      )
    } catch (err) {
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      } else if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new UnprocessableEntityException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => [FileUploadOutput])
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', { nullable: false }, ParseIntPipe) groupId: number,
    @Args('input') input: FileUploadInput
  ): Promise<Problem[]> {
    try {
      return await this.problemService.importProblems(
        req.user.id,
        groupId,
        input
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new BadRequestException(error.message)
      } else if (error instanceof InvalidFileFormatException) {
        throw new BadRequestException(error.message)
      }
    }
  }

  @Query(() => [Problem])
  async getProblems(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('cursor', { nullable: true }, CursorValidationPipe) cursor: number,
    @Args('take', { type: () => Int }) take: number,
    @Args('input') input: FilterProblemsInput
  ) {
    return await this.problemService.getProblems(input, groupId, cursor, take)
  }

  @Query(() => Problem)
  async getProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.problemService.getProblem(id, groupId)
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name == 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Problem)
  async updateProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    try {
      return await this.problemService.updateProblem(input, groupId)
    } catch (err) {
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.name == 'NotFoundError') {
          throw new NotFoundException(err.message)
        } else if (err.code === 'P2003') {
          throw new UnprocessableEntityException(err.message)
        }
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Problem)
  async deleteProblem(
    @Args('groupId', { defaultValue: OPEN_SPACE_ID }, ParseIntPipe)
    groupId: number,
    @Args('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.problemService.deleteProblem(id, groupId)
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.name == 'NotFoundError'
      ) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
