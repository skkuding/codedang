import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  DefaultValuePipe,
  ParseBoolPipe,
  Post,
  Body
} from '@nestjs/common'
import { AuthenticatedRequest } from '@libs/auth'
import { CursorValidationPipe, RequiredIntPipe } from '@libs/pipe'
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto'
import { NotificationService } from './notification.service'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 사용자의 알림 목록을 조회합니다.
   */
  @Get()
  getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('cursor', CursorValidationPipe) cursor: number | null,
    @Query('take', new DefaultValuePipe(8), new RequiredIntPipe('take'))
    take: number,
    @Query('isRead', new ParseBoolPipe({ optional: true }))
    isRead: boolean | null
  ) {
    return this.notificationService.getNotifications(
      req.user.id,
      cursor,
      take,
      isRead
    )
  }

  /**
   * 사용자의 읽지 않은 알림 개수를 조회합니다.
   */
  @Get('unread-count')
  getUnreadCount(@Req() req: AuthenticatedRequest) {
    return this.notificationService.getUnreadCount(req.user.id)
  }

  /**
   * 특정 알림을 읽음으로 표시합니다.
   */
  @Patch(':id/read')
  markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('notificationRecordId'))
    notificationRecordId: number
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
  markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationService.markAllAsRead(req.user.id)
  }

  /**
   * Push subscription을 삭제합니다
   * endpoint가 제공되지 않으면 해당 사용자의 모든 subscription을 삭제합니다
   */
  @Delete('/push-subscription')
  deletePushSubscription(
    @Req() req: AuthenticatedRequest,
    @Query('endpoint') endpoint?: string
  ) {
    return this.notificationService.deletePushSubscription(
      req.user.id,
      endpoint
    )
  }

  /**
   * 특정 알림을 삭제합니다.
   */
  @Delete(':id')
  deleteNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id', new RequiredIntPipe('notificationRecordId'))
    notificationRecordId: number
  ) {
    return this.notificationService.deleteNotification(
      req.user.id,
      notificationRecordId
    )
  }

  @Get('/push-subscription')
  getPushSubscriptions(@Req() req: AuthenticatedRequest) {
    return this.notificationService.getPushSubscriptions(req.user.id)
  }

  /**
   * Push subscription을 생성합니다
   */
  @Post('/push-subscription')
  createPushSubscription(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePushSubscriptionDto
  ) {
    return this.notificationService.createPushSubscription(req.user.id, dto)
  }

  /**
   * VAPID public key를 반환합니다
   */
  @Get('/vapid')
  getVapidPublicKey() {
    return this.notificationService.getVapidPublicKey()
  }
}
