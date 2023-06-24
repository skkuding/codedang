import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { WorkbookService } from './workbook.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { EntityNotExistException } from '@client/common/exception/business.exception'
import { GroupLeaderGuard } from '@client/group/guard/group-leader.guard'
import { RolesGuard } from '@client/user/guard/roles.guard'
import type { Workbook } from '@prisma/client'
import { AuthenticatedRequest } from '@client/auth/interface/authenticated-request.interface'
import { CursorValidationPipe } from '@client/common/pipe/cursor-validation.pipe'

@Controller('admin/group/:groupId/workbook')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class WorkbookAdminController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(
    @Param('groupId', ParseIntPipe) groupId,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getAdminWorkbooksByGroupId(
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
      return await this.workbookService.getAdminWorkbookById(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Post()
  async createWorkbook(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId,
    @Body() createWorkbookDto: CreateWorkbookDto
  ): Promise<Workbook> {
    try {
      return await this.workbookService.createWorkbook(
        createWorkbookDto,
        req.user.id,
        groupId
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Put('/:workbookId')
  async updateWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId,
    @Body() updateWorkbookDto: UpdateWorkbookDto
  ): Promise<Workbook> {
    try {
      return await this.workbookService.updateWorkbook(
        workbookId,
        updateWorkbookDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  @Delete('/:workbookId')
  async deleteWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId
  ): Promise<Workbook> {
    try {
      return await this.workbookService.deleteWorkbook(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}
