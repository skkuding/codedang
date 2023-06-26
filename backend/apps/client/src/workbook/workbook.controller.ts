import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
  Query
} from '@nestjs/common'
import type { Workbook } from '@prisma/client'
import { AuthNotNeeded } from '@libs/decorator/auth-ignore.decorator'
import { EntityNotExistException } from '@libs/exception/business.exception'
import { CursorValidationPipe } from '@libs/pipe/cursor-validation.pipe'
import { RolesGuard } from '@client/user/guard/roles.guard'
import { GroupMemberGuard } from '../group/guard/group-member.guard'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
@AuthNotNeeded()
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getWorkbooks(
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getWorkbooksByGroupId(cursor, take)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:workbookId')
  async getWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId
  ): Promise<Partial<Workbook>> {
    try {
      return await this.workbookService.getWorkbookById(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}

@Controller('group/:groupId/workbook')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupWorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(
    @Param('groupId', ParseIntPipe) groupId,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getWorkbooksByGroupId(
        cursor,
        take,
        groupId
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:workbookId')
  async getWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId
  ): Promise<Partial<Workbook>> {
    try {
      return await this.workbookService.getWorkbookById(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}
