import {
  ForbiddenException,
  InternalServerErrorException,
  Req,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql'
import { Role } from '@prisma/client'
import { type AuthenticatedRequest, UseRolesGuard } from '@libs/auth'
import {
  UnprocessableDataException,
  ForbiddenAccessException
} from '@libs/exception'
import { Workbook } from '@admin/@generated/workbook/workbook.model'
import { DeleteWorkbookArgs } from './dto/args/delete-workbook.args'
import { GetWorkbookArgs } from './dto/args/get-workbook.args'
import { NewWorkbookArgs } from './dto/args/new-workbook.args'
import { UpdateWorkbookArgs } from './dto/args/update-workbook.args'
import { GetWorkbookListInput } from './dto/input/workbook.input'
import { CreateWorkbookInput } from './dto/input/workbook.input'
import { UpdateWorkbookInput } from './dto/input/workbook.input'
import { WorkbookDetail } from './dto/output/workbook.output'
import { WorkbookService } from './workbook.service'

@Resolver(() => Workbook)
// Admin 권한이 필요한 Query에 한 해 @UseRolesGuard() 데코레이터 (Role.Admin이 Default) 향후 추가
// @UseRolesGuard(Role.Admin)
export class WorkbookResolver {
  constructor(private readonly workbookService: WorkbookService) {}

  @Mutation(() => Workbook, { name: 'createWorkbook' })
  async createWorkbook(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateWorkbookInput
  ) {
    try {
      return await this.workbookService.createWorkbook(input, req.user.id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Workbook, { name: 'updateWorkbook' })
  async updateWorkbook(@Args('input') input: UpdateWorkbookInput) {
    try {
      return this.workbookService.updateWorkbook(input)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Workbook], { name: 'getWorkbookList' })
  async getWorkbookList(@Args('input') input: GetWorkbookListInput) {
    try {
      return this.workbookService.getAdminWorkbooksByGroupId(input)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Workbook, { name: 'deleteWorkbook' })
  async removeWorkbook(@Args('workbookId', { type: () => Int }) id: number) {
    try {
      return this.workbookService.deleteWorkbook(id)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Query(() => WorkbookDetail, { name: 'getWorkbookDetail' })
  async getWorkbookDetail(@Args('workbookId') id: number) {
    try {
      return this.workbookService.getWorkbookById(id)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Boolean, { name: 'importProblemsInWorkbook' })
  async importProblemsInWorkbook(
    @Args('problemIds', { type: () => [Int] }) idList: number[],
    @Args('workbookId', { type: () => Int }) id: number
  ) {
    try {
      return this.workbookService.mapProblemstoWorkbook(idList, id)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
