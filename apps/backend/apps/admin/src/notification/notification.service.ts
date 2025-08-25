import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ContestRole, NotificationType } from '@prisma/client'
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
          group: {
            select: {
              id: true,
              groupName: true
            }
          }
        }
      })

      const title = assignmentInfo?.group.groupName ?? 'Assignment'
      const message = `Your assignment "${assignmentInfo?.title ?? ''}" has been graded.`
      const url = `/course/${assignmentInfo?.group.id}/assignment/${assignmentId}`

      await this.saveNotification(
        [userId],
        title,
        message,
        NotificationType.Assignment,
        url
      )

      await this.sendPushNotification([userId], title, message, url)
    }
  }

  async notifyAssignmentCreated(assignmentId: number) {
    const assignmentInfo = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        title: true,
        group: {
          select: {
            id: true,
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
    const url = `/course/${assignmentInfo?.group.id}/assignment/${assignmentId}`

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Assignment,
      url
    )

    await this.sendPushNotification(receivers, title, message, url)
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
      icon: '/logos/transparent.png',
      badge: '/logos/codedang-badge.png',
      data: { url }
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

  async notifyContestStartingSoon(contestId: number) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        title: true,
        userContest: {
          where: {
            role: ContestRole.Participant // 대회 참가자에게만 발송
          },
          select: { userId: true }
        }
      }
    })
    if (!contest) return

    const receivers = contest.userContest
      .map((r) => r.userId)
      .filter((id): id is number => typeof id === 'number')
    const title = 'Contest Start Reminder'
    const message = `The contest "${contest.title ?? ''}" will start in 1 hour.`
    const url = `/contest/${contestId}`

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Contest,
      url
    )
    await this.sendPushNotification(receivers, title, message, url)
  }
}
