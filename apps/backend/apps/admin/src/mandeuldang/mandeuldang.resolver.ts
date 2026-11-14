import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { ToolType } from '@prisma/client'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { MandeuldangProblem, MandeuldangTool } from '@admin/@generated'
import { MandeuldangService } from './mandeuldang.service'

@Resolver(() => MandeuldangProblem)
@UseDisableAdminGuard()
export class MandeuldangResolver {
  constructor(private readonly mandeuldangService: MandeuldangService) {}

  @Mutation(() => MandeuldangTool)
  async uploadMandeuldangTool(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('toolType', { type: () => ToolType }) toolType: ToolType,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>
  ) {
    return this.mandeuldangService.uploadMandeuldangTool(
      problemId,
      toolType,
      await file,
      req.user.id,
      req.user.role
    )
  }

  @Mutation(() => MandeuldangTool)
  async deleteMandeuldangTool(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('toolType', { type: () => ToolType }) toolType: ToolType
  ) {
    return this.mandeuldangService.deleteMandeuldangTool(
      problemId,
      toolType,
      req.user.id,
      req.user.role
    )
  }
}
