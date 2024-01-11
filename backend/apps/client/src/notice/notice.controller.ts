import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  DefaultValuePipe,
  ParseBoolPipe
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IdValidationPipe } from 'libs/pipe/src/id-validation.pipe'
import { UseGroupMemberGuardOrNoAuth } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import { CursorValidationPipe } from '@libs/pipe'
import { NoticeService } from './notice.service'

@Controller('notice')
@UseGroupMemberGuardOrNoAuth()
export class NoticeController {
  private readonly logger = new Logger(NoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('search') search?: string
  ) {
    try {
      return await this.noticeService.getNotices({
        cursor,
        take,
        fixed,
        search,
        groupId: groupId ?? OPEN_SPACE_ID
      })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getNoticeByID(
    @Query('groupId', IdValidationPipe) groupId: number | null,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.noticeService.getNoticeByID(
        id,
        groupId ?? OPEN_SPACE_ID
      )
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
