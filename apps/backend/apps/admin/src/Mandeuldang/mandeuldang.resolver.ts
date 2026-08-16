import { Args, Int, Mutation, Resolver } from '@nestjs/graphql'
import { ToolType } from '@prisma/client'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { UseDisableAdminGuard } from '@libs/auth'
import { MandeuldangProblem, MandeuldangTool } from '@admin/@generated'
import { MandeuldangService } from './Mandeuldang.service'

@Resolver(() => MandeuldangProblem)
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
}
