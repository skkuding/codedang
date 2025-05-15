import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { ProblemTestcase } from '@generated'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { ProblemIDPipe } from '@libs/pipe'
import {
  CreateTestcasesInput,
  UploadTestcaseZipInput,
  UploadFileInput
} from '../model/problem.input'
import { ProblemTestcaseId } from '../model/problem.output'
import { TestcaseService } from '../services/testcase.service'

@Resolver(() => ProblemTestcaseId)
@UseDisableAdminGuard()
export class TestcaseResolver {
  constructor(private readonly testcaseService: TestcaseService) {}

  @Mutation(() => [ProblemTestcaseId])
  async createTestcases(
    @Args('input', { type: () => CreateTestcasesInput })
    input: CreateTestcasesInput
  ): Promise<ProblemTestcaseId[]> {
    return await this.testcaseService.createTestcases(
      input.testcases,
      input.problemId
    )
  }

  @Mutation(() => [ProblemTestcaseId])
  async uploadTestcaseZip(
    @Args('input', { type: () => UploadTestcaseZipInput })
    input: UploadTestcaseZipInput
  ): Promise<ProblemTestcaseId[]> {
    return await this.testcaseService.uploadTestcaseZip(
      await input.file,
      input.problemId
    )
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
