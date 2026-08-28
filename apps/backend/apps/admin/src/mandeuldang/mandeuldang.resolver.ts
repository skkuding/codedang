import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { ToolType } from '@prisma/client'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { MandeuldangRunRequest, MandeuldangTool } from '@admin/@generated'
import { MandeuldangService } from './mandeuldang.service'

@Resolver()
@UseDisableAdminGuard()
export class MandeuldangResolver {
  constructor(private readonly mandeuldangService: MandeuldangService) {}

  @Mutation(() => MandeuldangTool)
  async uploadMandeuldangTool(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('toolType', { type: () => ToolType }) toolType: ToolType,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>
  ) {
    return this.mandeuldangService.uploadMandeuldangTool(
      problemId,
      toolType,
      await file
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
    @Args('testCaseCount', { type: () => Int }) testCaseCount: number
  ) {
    return this.mandeuldangService.runGenerator(
      problemId,
      req.user.id,
      generatorArgs,
      testCaseCount
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
