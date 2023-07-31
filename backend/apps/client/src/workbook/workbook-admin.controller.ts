import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  RolesGuard,
  GroupLeaderGuard
} from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import { CursorValidationPipe } from '@libs/pipe'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { WorkbookService } from './workbook.service'

@Controller('admin/group/:groupId/workbook')
@UseGuards(RolesGuard, GroupLeaderGuard)
export class WorkbookAdminController {
  private readonly logger = new Logger(WorkbookAdminController.name)

  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(
    @Param('groupId', ParseIntPipe) groupId,
    @Query('cursor', CursorValidationPipe) cursor: number,
    @Query('take', ParseIntPipe) take: number
  ) {
    try {
      return await this.workbookService.getAdminWorkbooksByGroupId(
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
      return await this.workbookService.getAdminWorkbookById(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Post()
  async createWorkbook(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId,
    @Body() createWorkbookDto: CreateWorkbookDto
  ) {
    try {
      return await this.workbookService.createWorkbook(
        createWorkbookDto,
        req.user.id,
        groupId
      )
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Put(':workbookId')
  async updateWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId,
    @Body() updateWorkbookDto: UpdateWorkbookDto
  ) {
    try {
      return await this.workbookService.updateWorkbook(
        workbookId,
        updateWorkbookDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  @Delete(':workbookId')
  async deleteWorkbook(@Param('workbookId', ParseIntPipe) workbookId) {
    try {
      return await this.workbookService.deleteWorkbook(workbookId)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
