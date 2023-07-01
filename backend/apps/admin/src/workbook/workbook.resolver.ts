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
import { NewWorkbookInput } from './dto/new-workbook.input'
import { WorkbookService } from './workbook.service'

@Resolver(() => Workbook)
export class WorkbookResolver {
  constructor(private readonly workbookService: WorkbookService) {}

  @Mutation(() => Workbook, { name: 'createWorkbook' })
  async createWorkbook(
    @Context('req') req,
    @Args() newWorkbookInput: NewWorkbookInput
  ) {
    try {
      return await this.workbookService.createWorkbook(
        newWorkbookInput,
        req.user.id
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  // @Query(() => [Workbook], { name: 'workbook' })
  // findAll() {
  //   return this.workbookService.findAll()
  // }

  // @Query(() => Workbook, { name: 'workbook' })
  // getWorkbookList(@Args('id', { type: () => Int }) id: number) {
  //   return this.workbookService.findOne(id)
  // }

  // @Mutation(() => Workbook)
  // updateWorkbook(
  //   @Args('updateWorkbookInput') updateWorkbookInput: UpdateWorkbookInput
  // ) {
  //   return this.workbookService.updateWorkbook(
  //     updateWorkbookInput.id,
  //     updateWorkbookInput
  //   )
  // }

  // @Mutation(() => Workbook)
  // removeWorkbook(@Args('id', { type: () => Int }) id: number) {
  //   return this.workbookService.deleteWorkbook(id)
  // }
}
