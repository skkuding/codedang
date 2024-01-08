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
import { AuthNotNeeded, GroupMemberGuard } from '@libs/auth'
import { CursorValidationPipe } from '@libs/pipe'
import { NoticeService } from './notice.service'

@Controller('notice')
@AuthNotNeeded()
export class NoticeController {
  private readonly logger = new Logger(NoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('search', new DefaultValuePipe('')) search: string
  ) {
    try {
      return await this.noticeService.getNotices({
        cursor,
        take,
        fixed,
        search
      })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getNoticeByID(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.noticeService.getNoticeByID(id)
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

@Controller('group/:groupId/notice')
@UseGuards(GroupMemberGuard)
export class GroupNoticeController {
  private readonly logger = new Logger(GroupNoticeController.name)

  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('fixed', new DefaultValuePipe(false), ParseBoolPipe) fixed: boolean,
    @Query('search', new DefaultValuePipe('')) search: string
  ) {
    try {
      return await this.noticeService.getNotices({
        cursor,
        take,
        fixed,
        search,
        groupId
      })
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  async getNoticeByID(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      return await this.noticeService.getNoticeByID(id, groupId)
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
