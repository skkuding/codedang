import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  EntityNotExistException,
  ConflictFoundException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto'

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /**
   * 사용자의 알림 목록을 조회합니다
   * @param userId - 사용자 ID
   * @param cursor - 커서 기반 페이징을 위한 마지막 알림 ID
   * @param take - 가져올 알림 수 (기본값: 8)
   */
  async getNotifications(
    userId: number,
    cursor: number | null,
    take: number,
    isRead: boolean | null
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const whereOptions = {
      userId,
      isRead: isRead !== null ? isRead : undefined
    }

    const notificationRecords = await this.prisma.notificationRecord.findMany({
      ...paginator,
      take,
      where: whereOptions,
      include: {
        notification: true
      },
      orderBy: {
        createTime: 'desc'
      }
    })

    return notificationRecords.map((record) => ({
      id: record.id,
      notificationId: record.notificationId,
      title: record.notification.title,
      message: record.notification.message,
      url: record.notification.url,
      type: record.notification.type,
      isRead: record.isRead,
      createTime: record.createTime
    }))
  }

  /**
   * 사용자의 읽지 않은 알림 개수를 조회합니다
   * @param userId - 사용자 ID
   */
  async getUnreadCount(userId: number) {
    return this.prisma.notificationRecord.count({
      where: {
        userId,
        isRead: false
      }
    })
  }

  /**
   * 특정 알림을 읽음으로 표시합니다
   * @param userId - 사용자 ID
   * @param notificationRecordId - 알림 레코드 ID
   */
  async markAsRead(userId: number, notificationRecordId: number) {
    try {
      const updated = await this.prisma.notificationRecord.update({
        where: {
          id: notificationRecordId,
          userId
        },
        data: {
          isRead: true
        }
      })

      return updated
    } catch {
      throw new EntityNotExistException('NotificationRecord')
    }
  }

  /**
   * 사용자의 모든 알림을 읽음으로 표시합니다
   * @param userId - 사용자 ID
   */
  async markAllAsRead(userId: number) {
    const updated = await this.prisma.notificationRecord.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return { successCount: updated.count }
  }

  /**
   * 특정 알림을 삭제합니다
   * @param userId - 사용자 ID
   * @param notificationRecordId - 알림 레코드 ID
   */
  async deleteNotification(userId: number, notificationRecordId: number) {
    try {
      const recordDeleted = await this.prisma.notificationRecord.delete({
        where: {
          id: notificationRecordId,
          userId
        }
      })

      await this.prisma.notification.deleteMany({
        where: {
          id: recordDeleted.notificationId,
          NotificationRecord: { none: {} }
        }
      })

      return recordDeleted
    } catch {
      throw new EntityNotExistException('NotificationRecord')
    }
  }

  /**
   * Push subscription 목록을 조회합니다
   */
  getPushSubscriptions(userId: number) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        endpoint: true,
        userAgent: true,
        createTime: true
      }
    })
  }

  /**
   * Push subscription을 생성합니다
   */
  async createPushSubscription(userId: number, dto: CreatePushSubscriptionDto) {
    try {
      return await this.prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: dto.endpoint,
          p256dh: dto.keys.p256dh,
          auth: dto.keys.auth,
          userAgent: dto.userAgent
        }
      })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictFoundException('Push subscription already exists')
      }
      throw error
    }
  }

  /**
   * VAPID public key를 반환합니다
   */
  getVapidPublicKey() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY')
    if (!publicKey) {
      throw new Error('VAPID_PUBLIC_KEY is not configured')
    }
    return { publicKey }
  }

  /**
   * Push subscription을 삭제합니다
   * @param userId - 사용자 ID
   * @param endpoint - Push subscription endpoint (없으면 모든 subscription 삭제)
   */
  async deletePushSubscription(userId: number, endpoint?: string) {
    try {
      if (endpoint) {
        const deleted = await this.prisma.pushSubscription.delete({
          where: {
            //eslint-disable-next-line @typescript-eslint/naming-convention
            userId_endpoint: { userId, endpoint }
          }
        })
        return { deletedCount: 1, subscription: deleted }
      } else {
        const deleted = await this.prisma.pushSubscription.deleteMany({
          where: { userId }
        })
        return { deletedCount: deleted.count }
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new EntityNotExistException('PushSubscription')
      }
      throw error
    }
  }
}
