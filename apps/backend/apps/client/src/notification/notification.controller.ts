import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Req,
  DefaultValuePipe
} from '@nestjs/common'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { NotificationService } from './notification.service'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 사용자의 알림 목록을 조회합니다.
   */
  @Get()
  async getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(8), new RequiredIntPipe('take'))
    take: number
  ) {
    return this.notificationService.getNotifications(req.user.id, cursor, take)
  }

  /**
   * 특정 알림을 읽음으로 표시합니다.
   */
  @Patch(':id/read')
  async markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) notificationRecordId: number
  ) {
    return this.notificationService.markAsRead(
      req.user.id,
      notificationRecordId
    )
  }

  /**
   * 모든 알림을 읽음으로 표시합니다.
   */
  @Patch('read-all')
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationService.markAllAsRead(req.user.id)
  }

  /**
   * 특정 알림을 삭제합니다.
   */
  @Delete(':id')
  async deleteNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) notificationRecordId: number
  ) {
    return this.notificationService.deleteNotification(
      req.user.id,
      notificationRecordId
    )
  }
}
