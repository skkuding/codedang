import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  Query
} from '@nestjs/common'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
@AuthNotNeededIfOpenSpace()
export class WorkbookController {
  private readonly logger = new Logger(WorkbookController.name)

  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getWorkbooks(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), new RequiredIntPipe('take'))
    take: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.workbookService.getWorkbooksByGroupId(
      cursor,
      take,
      groupId
    )
  }

  @Get(':workbookId')
  async getWorkbook(
    @Param('workbookId', new RequiredIntPipe('workbookId')) workbookId,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.workbookService.getWorkbook(workbookId, groupId)
  }
}
