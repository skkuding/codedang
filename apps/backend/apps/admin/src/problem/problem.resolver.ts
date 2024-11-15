import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ParseArrayPipe,
  UnprocessableEntityException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import {
  Args,
  Context,
  Query,
  Int,
  Mutation,
  Resolver,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import {
  ContestProblem,
  Image,
  ProblemTag,
  ProblemTestcase,
  WorkbookProblem
} from '@generated'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { ProblemScoreInput } from '@admin/contest/model/problem-score.input'
import { ImageSource } from './model/image.output'
import {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput
} from './model/problem.input'
import { ProblemWithIsVisible } from './model/problem.output'
import { ProblemService } from './problem.service'

@Resolver(() => ProblemWithIsVisible)
export class ProblemResolver {
  private readonly logger = new Logger(ProblemResolver.name)

  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => ProblemWithIsVisible)
  async createProblem(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
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

  @Mutation(() => [ProblemWithIsVisible])
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async uploadProblems(
    @Context('req') req: AuthenticatedRequest,
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
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

  @Mutation(() => ImageSource)
  async uploadImage(
    @Args('input') input: UploadFileInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    try {
      return await this.problemService.uploadImage(input, req.user.id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Image)
  async deleteImage(
    @Args('filename') filename: string,
    @Context('req') req: AuthenticatedRequest
  ) {
    try {
      return await this.problemService.deleteImage(filename, req.user.id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw error.convert2HTTPException()
      } else if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [ProblemWithIsVisible])
  async getProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number | null,
    @Args('take', { defaultValue: 10, type: () => Int }) take: number,
    @Args('input') input: FilterProblemsInput
  ) {
    return await this.problemService.getProblems(input, groupId, cursor, take)
  }

  @Query(() => ProblemWithIsVisible)
  async getProblem(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
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

  @ResolveField('tag', () => [ProblemTag])
  async getProblemTags(@Parent() problem: ProblemWithIsVisible) {
    try {
      return await this.problemService.getProblemTags(problem.id)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @ResolveField('testcase', () => [ProblemTestcase])
  async getProblemTestCases(@Parent() problem: ProblemWithIsVisible) {
    try {
      return await this.problemService.getProblemTestcases(problem.id)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => ProblemWithIsVisible)
  async updateProblem(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
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

  @Mutation(() => ProblemWithIsVisible)
  async deleteProblem(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
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
}

@Resolver(() => ContestProblem)
export class ContestProblemResolver {
  private readonly logger = new Logger(ProblemResolver.name)

  constructor(private readonly problemService: ProblemService) {}

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
  async updateContestProblemsScore(
    @Args('groupId', { type: () => Int }, GroupIDPipe) groupId: number,
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemIdsWithScore', { type: () => [ProblemScoreInput] })
    problemIdsWithScore: ProblemScoreInput[]
  ) {
    return await this.problemService.updateContestProblemsScore(
      groupId,
      contestId,
      problemIdsWithScore
    )
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

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() contestProblem: ContestProblem) {
    try {
      return await this.problemService.getProblemById(contestProblem.problemId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}

@Resolver(() => WorkbookProblem)
export class WorkbookProblemResolver {
  private readonly logger = new Logger(ProblemResolver.name)

  constructor(private readonly problemService: ProblemService) {}

  @Query(() => [WorkbookProblem], { name: 'getWorkbookProblems' })
  async getWorkbookProblems(
    @Args(
      'groupId',
      { defaultValue: OPEN_SPACE_ID, type: () => Int },
      GroupIDPipe
    )
    groupId: number,
    @Args('workbookId', { type: () => Int }) workbookId: number
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
    @Args('workbookId', { type: () => Int }) workbookId: number,
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

  @ResolveField('problem', () => ProblemWithIsVisible)
  async getProblem(@Parent() workbookProblem: WorkbookProblem) {
    try {
      return await this.problemService.getProblemById(workbookProblem.problemId)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }
}
