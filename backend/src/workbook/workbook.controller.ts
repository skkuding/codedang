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
import { WorkbookService } from './workbook.service'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { GroupMemberGuard } from '../group/guard/group-member.guard'
import { Workbook } from '@prisma/client'
import { AuthNotNeeded } from 'src/common/decorator/auth-ignore.decorator'
import { CursorValidationPipe } from 'src/common/pipe/cursor-validation.pipe'

@Controller('workbook')
@AuthNotNeeded()
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getWorkbooks(): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getWorkbooksByGroupId()
    } catch (error) {
      throw new InternalServerErrorException()
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
        groupId,
        cursor,
        take
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
