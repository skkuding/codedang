import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { ToolType } from '@admin/@generated'
import {
  MandeuldangProblem,
  MandeuldangRunRequest,
  MandeuldangTool
} from '@admin/@generated'
import { MandeuldangService } from './mandeuldang.service'
import { UploadMandeuldangToolInput } from './model/mandeuldang-tool.input'

@Resolver(() => MandeuldangProblem)
@UseDisableAdminGuard()
export class MandeuldangResolver {
  constructor(private readonly mandeuldangService: MandeuldangService) {}

  @Mutation(() => MandeuldangTool)
  async uploadMandeuldangTool(
    @Args('input') input: UploadMandeuldangToolInput
  ) {
    return await this.mandeuldangService.uploadMandeuldangTool(
      input.problemId,
      input.toolType,
      await input.file
    )
  }

  @Mutation(() => MandeuldangTool)
  async deleteMandeuldangTool(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('toolType', { type: () => ToolType }) toolType: ToolType
  ) {
    return this.mandeuldangService.deleteMandeuldangTool(problemId, toolType)
  }

  @Mutation(() => MandeuldangRunRequest)
  async runGenerator(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('generatorArgs', { type: () => [String] }) generatorArgs: string[],
    @Args('testcaseCount', { type: () => Int }) testcaseCount: number
  ) {
    return this.mandeuldangService.runGenerator(
      problemId,
      req.user.id,
      generatorArgs,
      testcaseCount
    )
  }

  @Mutation(() => MandeuldangRunRequest)
  async runValidator(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return this.mandeuldangService.runValidator(problemId, req.user.id)
  }
}
