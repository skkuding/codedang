import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common'
import { AuthNotNeeded, GroupMemberGuard, RolesGuard } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
@AuthNotNeeded()
export class WorkbookController {
  private readonly logger = new Logger(WorkbookController.name)

  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getWorkbooks(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookService.getWorkbooksByGroupId(cursor, take)
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':workbookId')
  async getWorkbook(@Param('workbookId', ParseIntPipe) workbookId) {
    try {
      return await this.workbookService.getWorkbookById(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:groupId/workbook')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupWorkbookController {
  private readonly logger = new Logger(GroupWorkbookController.name)

  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(
    @Param('groupId', ParseIntPipe) groupId,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookService.getWorkbooksByGroupId(
        cursor,
        take,
        groupId
      )
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Get(':workbookId')
  async getWorkbook(@Param('workbookId', ParseIntPipe) workbookId) {
    try {
      return await this.workbookService.getWorkbookById(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
