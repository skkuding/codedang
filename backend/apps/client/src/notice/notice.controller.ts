import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  DefaultValuePipe,
  ParseBoolPipe
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GroupIdValidationPipe } from 'libs/pipe/src/group-id-validation.pipe'
import { AuthNotNeeded, GroupMemberGuard } from '@libs/auth'
import { CursorValidationPipe } from '@libs/pipe'
import { NoticeService } from './notice.service'

@Controller('notice')
@AuthNotNeeded()
@UseGuards(GroupMemberGuard)
export class NoticeController {
  private readonly logger = new Logger(NoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('groupId', GroupIdValidationPipe) groupId: number | null,
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
        groupId: groupId ? groupId : undefined
      })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getNoticeByID(
    @Query('groupId', GroupIdValidationPipe) groupId: number | null,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.noticeService.getNoticeByID(
        id,
        groupId ? groupId : undefined
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
