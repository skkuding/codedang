import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

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
    } catch (_error) {
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
    } catch (_error) {
      throw new EntityNotExistException('NotificationRecord')
    }
  }
}
