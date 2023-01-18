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
  Req,
  UseGuards
} from '@nestjs/common'
import { WorkbookService } from './workbook.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupLeaderGuard } from 'src/group/guard/group-leader.guard'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { Workbook } from '@prisma/client'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'

@Controller('admin/group/:groupId/workbook')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class WorkbookAdminController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(
    @Param('groupId', ParseIntPipe) groupId
  ): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getWorkbooksByGroupId(groupId, true)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:workbookId')
  async getWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId
  ): Promise<Workbook> {
    try {
      return await this.workbookService.getWorkbookById(workbookId, true)
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
    @Param('groupId', ParseIntPipe) groupId,
    @Body() createWorkbookDto: CreateWorkbookDto,
    @Req() req: AuthenticatedRequest
  ): Promise<Workbook> {
    try {
      return await this.workbookService.createWorkbook(
        req.user.id,
        groupId,
        createWorkbookDto
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
