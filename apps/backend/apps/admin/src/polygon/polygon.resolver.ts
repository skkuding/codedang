import { Args, Int, Mutation, Resolver } from '@nestjs/graphql'
import { ToolType } from '@prisma/client'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { UseDisableAdminGuard } from '@libs/auth'
import { PolygonProblem, PolygonTool } from '@admin/@generated'
import { PolygonService } from './polygon.service'

@Resolver(() => PolygonProblem)
@UseDisableAdminGuard()
export class PolygonResolver {
  constructor(private readonly polygonService: PolygonService) {}

  @Mutation(() => PolygonTool)
  async uploadPolygonTool(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('toolType', { type: () => ToolType }) toolType: ToolType,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>
  ) {
    return this.polygonService.uploadPolygonTool(
      problemId,
      toolType,
      await file
    )
  }

  @Mutation(() => PolygonTool)
  async deletePolygonTool(
    @Args('problemId', { type: () => Int }) problemId: number,
    @Args('toolType', { type: () => ToolType }) toolType: ToolType
  ) {
    return this.polygonService.deletePolygonTool(problemId, toolType)
  }
}
