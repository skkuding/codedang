import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ParseArrayPipe,
  UnprocessableEntityException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { Args, Context, Query, Int, Mutation, Resolver } from '@nestjs/graphql'
import { ContestProblem, Problem, WorkbookProblem } from '@generated'
import { Prisma } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput
} from './model/problem.input'
import { ProblemService } from './problem.service'

@Resolver(() => Problem)
export class ProblemResolver {
  private readonly logger = new Logger(ProblemResolver.name)

  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => Problem)
  async createProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'groupId',
      { type: () => Int, defaultValue: OPEN_SPACE_ID },
      GroupIDPipe
    )
    groupId: number,
    @Args('input') input: CreateProblemInput
  ) {
    try {
      return await this.problemService.createProblem(
        input,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw error.convert2HTTPException()
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new UnprocessableEntityException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => [Problem])
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'groupId',
      { type: () => Int, defaultValue: OPEN_SPACE_ID },
      GroupIDPipe
    )
    groupId: number,
    @Args('input') input: UploadFileInput
  ) {
    try {
      return await this.problemService.uploadProblems(
        input,
        req.user.id,
        groupId
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Problem])
  async getProblems(
    @Args(
      'groupId',
      { type: () => Int, defaultValue: OPEN_SPACE_ID },
      GroupIDPipe
    )
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
    @Args('input') input: FilterProblemsInput
  ) {
    return await this.problemService.getProblems(input, groupId, cursor, take)
  }

  @Query(() => Problem)
  async getProblem(
    @Args(
      'groupId',
      { type: () => Int, defaultValue: OPEN_SPACE_ID },
      GroupIDPipe
    )
    groupId: number,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    try {
      return await this.problemService.getProblem(id, groupId)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Problem)
  async updateProblem(
    @Args(
      'groupId',
      { type: () => Int, defaultValue: OPEN_SPACE_ID },
      GroupIDPipe
    )
    groupId: number,
    @Args('input') input: UpdateProblemInput
  ) {
    try {
      return await this.problemService.updateProblem(input, groupId)
    } catch (error) {
      if (
        error instanceof UnprocessableDataException ||
        error instanceof ConflictFoundException
      ) {
        throw error.convert2HTTPException()
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.name == 'NotFoundError') {
          throw new NotFoundException(error.message)
        } else if (error.code === 'P2003') {
          throw new UnprocessableEntityException(error.message)
        }
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Problem)
  async deleteProblem(
    @Args(
      'groupId',
      { type: () => Int, defaultValue: OPEN_SPACE_ID },
      GroupIDPipe
    )
    groupId: number,
    @Args('id', { type: () => Int }, new RequiredIntPipe('id')) id: number
  ) {
    try {
      return await this.problemService.deleteProblem(id, groupId)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name == 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [WorkbookProblem], { name: 'getWorkbookProblems' })
  async getWorkbookProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('workbookId', { type: () => Int }, new RequiredIntPipe('workbookId'))
    workbookId: number
  ) {
    try {
      return await this.problemService.getWorkbookProblems(groupId, workbookId)
    } catch (error) {
      if (
        error instanceof UnprocessableDataException ||
        error instanceof ForbiddenAccessException
      ) {
        throw error.convert2HTTPException()
      } else if (error.code == 'P2025') {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  @Mutation(() => [WorkbookProblem])
  async updateWorkbookProblemsOrder(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('workbookId', { type: () => Int }, new RequiredIntPipe('workbookId'))
    workbookId: number,
    // orders는 항상 workbookId에 해당하는 workbookProblems들이 모두 딸려 온다.
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    try {
      return await this.problemService.updateWorkbookProblemsOrder(
        groupId,
        workbookId,
        orders
      )
    } catch (error) {
      if (
        error instanceof UnprocessableDataException ||
        error instanceof ForbiddenAccessException
      ) {
        throw error.convert2HTTPException()
      } else if (error.code == 'P2025') {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  @Query(() => [ContestProblem], { name: 'getContestProblems' })
  async getContestProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number
  ) {
    try {
      return await this.problemService.getContestProblems(groupId, contestId)
    } catch (error) {
      if (
        error instanceof UnprocessableDataException ||
        error instanceof ForbiddenAccessException
      ) {
        throw error.convert2HTTPException()
      } else if (error.code == 'P2025') {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  @Mutation(() => [ContestProblem])
  async updateContestProblemsOrder(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('contestId', { type: () => Int }, new RequiredIntPipe('contestId'))
    contestId: number,
    @Args('orders', { type: () => [Int] }, ParseArrayPipe) orders: number[]
  ) {
    try {
      return await this.problemService.updateContestProblemsOrder(
        groupId,
        contestId,
        orders
      )
    } catch (error) {
      if (
        error instanceof UnprocessableDataException ||
        error instanceof ForbiddenAccessException
      ) {
        throw error.convert2HTTPException()
      } else if (error.code == 'P2025') {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }
}
