import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ProblemTestcase } from '@generated'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { IDValidationPipe, ProblemIDPipe } from '@libs/pipe'
import {
  CreateTestcasesInput,
  UploadTestcaseZipInput,
  UploadFileInput,
  UploadTestcaseZipLegacyInput
} from '../model/problem.input'
import { ProblemTestcaseId } from '../model/problem.output'
import { TestcaseService } from '../services/testcase.service'

@Resolver(() => ProblemTestcaseId)
@UseDisableAdminGuard()
export class TestcaseResolver {
  constructor(private readonly testcaseService: TestcaseService) {}

  @Query(() => ProblemTestcase)
  async getTestcase(
    @Context('req') req: AuthenticatedRequest,
    @Args('testcaseId', { type: () => Int }, IDValidationPipe)
    testcaseId: number
  ) {
    return await this.testcaseService.getProblemTestcase(
      testcaseId,
      req.user.id,
      req.user.role
    )
  }

  @Mutation(() => [ProblemTestcaseId])
  async createTestcases(
    @Context('req') req: AuthenticatedRequest,
    @Args('input', { type: () => CreateTestcasesInput })
    input: CreateTestcasesInput
  ): Promise<ProblemTestcaseId[]> {
    return await this.testcaseService.createTestcases(
      input.testcases,
      input.problemId,
      req.user.id,
      req.user.role
    )
  }

  @Mutation(() => [ProblemTestcaseId])
  async uploadTestcaseZip(
    @Context('req') req: AuthenticatedRequest,
    @Args('input', { type: () => UploadTestcaseZipInput })
    input: UploadTestcaseZipInput
  ): Promise<ProblemTestcaseId[]> {
    return await this.testcaseService.uploadTestcaseZip(
      await input.file,
      input.problemId,
      req.user.id,
      req.user.role
    )
  }

  @Mutation(() => [ProblemTestcaseId])
  async uploadTestcaseZipLegacy(
    @Context('req') req: AuthenticatedRequest,
    @Args('input', { type: () => UploadTestcaseZipLegacyInput })
    input: UploadTestcaseZipLegacyInput
  ): Promise<ProblemTestcaseId[]> {
    return await this.testcaseService.uploadTestcaseZipLegacy({
      file: await input.file,
      problemId: input.problemId,
      isHidden: input.isHidden,
      scoreWeights: input.scoreWeights,
      userRole: req.user.role,
      userId: req.user.id
    })
  }

  @Mutation(() => ProblemTestcase)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async uploadTestcase(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, ProblemIDPipe)
    problemId: number,
    @Args('input') input: UploadFileInput
  ) {
    return await this.testcaseService.uploadTestcase(
      input,
      problemId,
      req.user.role,
      req.user.id
    )
  }
}

// test용 annotation
