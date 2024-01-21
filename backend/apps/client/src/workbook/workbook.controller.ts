import {
  Controller,
  DefaultValuePipe,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GroupIDPipe } from 'libs/pipe/src/group-id.pipe'
import { AuthNotNeededIfOpenSpace } from '@libs/auth'
import { CursorValidationPipe } from '@libs/pipe'
import { WorkbookService } from './workbook.service'

@Controller('workbook')
@AuthNotNeededIfOpenSpace()
export class WorkbookController {
  private readonly logger = new Logger(WorkbookController.name)

  constructor(private readonly workbookService: WorkbookService) {}

  @Get()
  async getWorkbooks(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.workbookService.getWorkbooksByGroupId(
        cursor,
        take,
        groupId
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':workbookId')
  async getWorkbook(
    @Param('workbookId', ParseIntPipe) workbookId,
    @Query('groupId', GroupIDPipe) groupId: number
  ) {
    try {
      return await this.workbookService.getWorkbook(workbookId, groupId)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.name === 'NotFoundError'
      ) {
        throw new NotFoundException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
