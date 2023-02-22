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
import { Workbook } from '@prisma/client'
import { AuthNotNeeded } from 'src/common/decorator/auth-ignore.decorator'

@Controller('group/:groupId/workbook')
@UseGuards(RolesGuard, GroupMemberGuard)
export class GroupWorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getGroupWorkbooks(
    @Param('groupId', ParseIntPipe) groupId
  ): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getWorkbooksByGroupId(groupId, false)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('/:workbookId')
  async getGroupWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId
  ): Promise<Partial<Workbook>> {
    try {
      return await this.workbookService.getWorkbookById(workbookId, false)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}

@Controller('workbook')
@AuthNotNeeded()
export class PublicWorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getPublicWorkbooks(): Promise<Partial<Workbook>[]> {
    try {
      return await this.workbookService.getWorkbooksByGroupId(1, false)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
