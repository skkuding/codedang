import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  Query
} from '@nestjs/common'
import { AuthNotNeededIfPublic } from '@libs/auth'
import { CursorValidationPipe, GroupIDPipe, RequiredIntPipe } from '@libs/pipe'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
@AuthNotNeededIfPublic()
export class WorkbookController {
  private readonly logger = new Logger(WorkbookController.name)

  constructor(private readonly workbookService: WorkbookService) {}

  /**
   * 그룹에 속한 공개 문제집 목록을 조회합니다.
   */
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

  /**
   * 공개된 문제집의 정보와 포함된 문제 목록을 조회합니다.
   */
  @Get(':workbookId')
  async getWorkbook(
    @Param('workbookId', new RequiredIntPipe('workbookId')) workbookId,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    return await this.workbookService.getWorkbook(workbookId, groupId)
  }
}
