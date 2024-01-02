import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ParseArrayPipe,
  ParseIntPipe, // Req,
  UnprocessableEntityException // UseGuards
} from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql'
import { AuthenticatedRequest } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  UnprocessableDataException,
  ForbiddenAccessException,
  EntityNotExistException,
  ConflictFoundException
} from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { WorkbookProblem } from '@admin/@generated/workbook-problem/workbook-problem.model'
import { CreateWorkbookInput } from './model/workbook.input'
import { UpdateWorkbookInput } from './model/workbook.input'
import { WorkbookModel } from './model/workbook.model'
import { WorkbookDetail } from './model/workbook.output'
import { WorkbookService } from './workbook.service'

@Resolver(() => WorkbookModel)
// Admin 권한이 필요한 Query에 한 해 @UseRolesGuard() 데코레이터 (Role.Admin이 Default) 향후 추가
// @UseRolesGuard(Role.Admin)
export class WorkbookResolver {
  private readonly logger = new Logger(WorkbookResolver.name)
  constructor(private readonly workbookService: WorkbookService) {}

  @Query(() => [WorkbookModel])
  async getWorkbooks(
    @Args('groupId', {
      defaultValue: OPEN_SPACE_ID,
      type: () => Int,
      nullable: true
    })
    groupId: number,
    @Args('cursor', { nullable: true, type: () => Int }, CursorValidationPipe)
    cursor: number,
    @Args('take', { type: () => Int }) take: number
  ) {
    try {
      return await this.workbookService.getWorkbooks(groupId, cursor, take)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      } else if (error.code == 'P2025') {
        throw new EntityNotExistException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => WorkbookDetail)
  async getWorkbook(
    @Args('groupId', {
      type: () => Int,
      nullable: true,
      defaultValue: OPEN_SPACE_ID
    })
    groupId: number,
    @Args('workbookId', { type: () => Int }) id: number
  ) {
    try {
      return await this.workbookService.getWorkbook(groupId, id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => WorkbookModel)
  async createWorkbook(
    @Context('req') req: AuthenticatedRequest,
    @Args('groupId', {
      defaultValue: OPEN_SPACE_ID,
      type: () => Int,
      nullable: true
    })
    groupId: number,
    @Args('input')
    input: CreateWorkbookInput
  ) {
    try {
      return await this.workbookService.createWorkbook(
        groupId,
        req.user.id,
        input
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => WorkbookModel)
  async updateWorkbook(
    @Args('groupId', {
      type: () => Int,
      nullable: true,
      defaultValue: OPEN_SPACE_ID
    })
    groupId: number,
    @Args('workbookId', { type: () => Int }) id: number,
    @Args('input') input: UpdateWorkbookInput
  ) {
    try {
      return await this.workbookService.updateWorkbook(groupId, id, input)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => WorkbookModel)
  async deleteWorkbook(
    @Args('groupId', {
      type: () => Int,
      nullable: true,
      defaultValue: OPEN_SPACE_ID
    })
    groupId: number,
    @Args('workbookId', { type: () => Int }) id: number
  ) {
    try {
      return await this.workbookService.deleteWorkbook(groupId, id)
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  // TODO: 기획 방향에 따라서, WorkbookProblem Record를 추가하는 것을 Workbook module에 추가할지, Problem module에 추가할지 결정해야 함.
  // 아니면 둘 다 추가해야 할지도 모르겠음.
  @Mutation(() => [WorkbookProblem])
  async createWorkbookProblems(
    @Args('groupId', { type: () => Int }) groupId: number,
    @Args('problemIds', { type: () => [Int] }, ParseArrayPipe)
    problemIds: number[],
    @Args('workbookId', { type: () => Int }, ParseIntPipe) workbookId: number
  ) {
    try {
      return await this.workbookService.createWorkbookProblems(
        groupId,
        problemIds,
        workbookId
      )
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      } else if (error instanceof ForbiddenAccessException) {
        throw new ForbiddenException(error.message)
      } else if (error instanceof ConflictFoundException) {
        throw new ConflictException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException(error.message)
    }
  }
}
