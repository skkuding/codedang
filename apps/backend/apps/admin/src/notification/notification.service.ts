import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NotificationType } from '@prisma/client'
import * as webpush from 'web-push'
import { PrismaService } from '@libs/prisma'
import { AssignmentService } from '@admin/assignment/assignment.service'

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: AssignmentService,
    private readonly config: ConfigService
  ) {
    const vapidKeys = {
      publicKey: this.config.get('VAPID_PUBLIC_KEY'),
      privateKey: this.config.get('VAPID_PRIVATE_KEY')
    }

    if (vapidKeys.publicKey && vapidKeys.privateKey) {
      webpush.setVapidDetails(
        'mailto:skkucodingplatform@gmail.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      )
    }
  }

  async notifyAssignmentGraded(assignmentId: number, userId: number) {
    const isGradingDone =
      await this.assignmentService.isAllAssignmentProblemGraded(
        assignmentId,
        userId
      )

    if (isGradingDone) {
      const assignmentInfo = await this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
          title: true,
          group: { select: { groupName: true } }
        }
      })

      const title = assignmentInfo?.group.groupName ?? 'Assignment'
      const message = `Your assignment "${assignmentInfo?.title ?? ''}" has been graded.`

      await this.saveNotification(
        [userId],
        title,
        message,
        NotificationType.Assignment
      )

      await this.sendPushNotification([userId], title, message)
    }
  }

  async notifyAssignmentCreated(assignmentId: number) {
    const assignmentInfo = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        title: true,
        group: {
          select: {
            groupName: true,
            userGroup: { select: { userId: true } }
          }
        }
      }
    })

    const receivers =
      assignmentInfo?.group.userGroup.map((user) => user.userId) ?? []

    const title = assignmentInfo?.group.groupName ?? 'Assignment'
    const message = `A new assignment "${assignmentInfo?.title ?? ''}" has been created.`

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Assignment
    )

    await this.sendPushNotification(receivers, title, message)
  }

  private async saveNotification(
    userIds: number[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.Other,
    url?: string
  ) {
    if (userIds.length === 0) {
      return
    }

    const notification = await this.prisma.notification.create({
      data: {
        title,
        message,
        url,
        type
      }
    })

    const notificationRecords = userIds.map((userId) => ({
      notificationId: notification.id,
      userId
    }))

    await this.prisma.notificationRecord.createMany({
      data: notificationRecords
    })
  }

  /**
   * 사용자들에게 푸시 알림을 전송합니다
   */
  private async sendPushNotification(
    userIds: number[],
    title: string,
    message: string,
    url?: string
  ) {
    if (userIds.length === 0) {
      return
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId: { in: userIds }
      }
    })

    const payload = JSON.stringify({
      title,
      body: message,
      url,
      icon: 'https://codedang.com/apple-icon.png',
      badge: 'https://codedang.com/icon.png'
    })

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          payload
        )
      } catch (error) {
        console.error(
          `Failed to send push notification to user ${subscription.userId}:`,
          error
        )

        if (error?.statusCode === 410) {
          await this.prisma.pushSubscription.delete({
            where: { id: subscription.id }
          })
        }
      }
    })

    await Promise.allSettled(sendPromises)
  }
}
