import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  InternalServerErrorException,
  NotFoundException,
  UseGuards
} from '@nestjs/common'
import { WorkbookService } from './workbook.service'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { GroupMemberGuard } from '../group/guard/group-member.guard'

@Controller('group/:groupId/workbook')
@UseGuards(RolesGuard, GroupMemberGuard)
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(@Param('groupId', ParseIntPipe) groupId) {
    try {
      return await this.workbookService.getWorkbooksByGroupId(groupId, false)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:workbookId')
  async getWorkbook(@Param('workbookId', ParseIntPipe) workbookId) {
    try {
      return await this.workbookService.getWorkbookById(workbookId, false)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException('Cannot find requested workbooks')
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}
