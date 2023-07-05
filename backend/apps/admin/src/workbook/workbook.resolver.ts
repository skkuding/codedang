import { InternalServerErrorException, Req, UseGuards } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import {
  type AuthenticatedRequest,
  Roles,
  RolesGuard,
  GroupLeaderGuard
} from '@libs/auth'
import { Workbook } from '@admin/@generated/workbook/workbook.model'
import { DeleteWorkbookArgs } from './dto/args/delete-workbook.args'
import { GetWorkbookArgs } from './dto/args/get-workbook.args'
import { NewWorkbookArgs } from './dto/args/new-workbook.args'
import { UpdateWorkbookArgs } from './dto/args/update-workbook.args'
import { WorkbookService } from './workbook.service'

@Resolver(() => Workbook)
export class WorkbookResolver {
  constructor(private readonly workbookService: WorkbookService) {}

  @Mutation(() => Workbook, { name: 'createWorkbook' })
  async createWorkbook(
    @Context('req') req,
    @Args() newWorkbookArgs: NewWorkbookArgs
  ) {
    try {
      return await this.workbookService.createWorkbook(
        newWorkbookArgs,
        req.user.id
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Workbook, { name: 'updateWorkbook' })
  async updateWorkbook(@Args() updateWorkbookArgs: UpdateWorkbookArgs) {
    try {
      return this.workbookService.updateWorkbook(updateWorkbookArgs)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Workbook], { name: 'getWorkbook' })
  async getWorkbookList(@Args() getWorkbookArgs: GetWorkbookArgs) {
    try {
      return this.workbookService.getAdminWorkbooksByGroupId(getWorkbookArgs)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Workbook, { name: 'deleteWorkbook' })
  async removeWorkbook(@Args() deleteWorkbookArgs: DeleteWorkbookArgs) {
    try {
      return this.workbookService.deleteWorkbook(deleteWorkbookArgs)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
