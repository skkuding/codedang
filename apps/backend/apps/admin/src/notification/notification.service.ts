import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ContestRole, NotificationType } from '@prisma/client'
import he from 'he'
import * as webpush from 'web-push'
import { MILLISECONDS_PER_HOUR } from '@libs/constants'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  constructor(
    private readonly prisma: PrismaService,
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

  async notifyAssignmentGraded(assignmentId: number) {
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

    if (!assignmentInfo) {
      return
    }

    const receivers = assignmentInfo.group.userGroup.map((user) => user.userId)

    const title = assignmentInfo.group.groupName ?? 'Assignment Graded'
    const message = `Your assignment "${assignmentInfo.title}" has been graded.`
    const url = `/course/${assignmentInfo.group.id}/assignment/${assignmentId}`

    if (receivers.length === 0) {
      return
    }

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Assignment,
      url
    )

    await this.sendPushNotification(receivers, title, message, url)
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

    if (!assignmentInfo) {
      return
    }

    const receivers = assignmentInfo.group.userGroup.map((user) => user.userId)
    const title = assignmentInfo.group.groupName ?? 'Assignment Created'
    const message = `A new assignment "${assignmentInfo.title}" has been created.`
    const url = `/course/${assignmentInfo.group.id}/assignment/${assignmentId}`

    if (receivers.length === 0) {
      return
    }

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Assignment,
      url
    )

    await this.sendPushNotification(receivers, title, message, url)
  }

  async notifyAssignmentDue(assignmentId: number) {
    const assignmentInfo = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        title: true,
        dueTime: true,
        group: {
          select: {
            id: true,
            groupName: true,
            userGroup: { select: { userId: true } }
          }
        }
      }
    })

    if (!assignmentInfo) {
      return
    }

    const receivers = assignmentInfo.group.userGroup.map((user) => user.userId)
    const title = assignmentInfo.group.groupName ?? 'Assignment Due Soon'

    const timing =
      assignmentInfo.dueTime.getTime() - Date.now() > 3 * MILLISECONDS_PER_HOUR
        ? '1 day'
        : '3 hours'

    const message = `Your assignment "${assignmentInfo.title}" is due in ${timing}.`
    const url = `/course/${assignmentInfo.group.id}/assignment/${assignmentId}`

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Assignment,
      url
    )
    await this.sendPushNotification(receivers, title, message, url)
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

  async notifyNoticeCreated(noticeId: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
      select: {
        title: true,
        content: true
      }
    })

    if (!notice) {
      return
    }

    const codedangUsers = await this.prisma.user.findMany({
      select: { id: true }
    })

    const receivers = codedangUsers.map((user) => user.id)
    const title = notice.title
    const processedContent = this.processNotificationText(notice.content)
    const message =
      (processedContent ?? 'New Notice Created.').slice(0, 100) +
      (processedContent.length > 100 ? '...' : '')
    const url = `/notice/${noticeId}`

    await this.saveNotification(
      receivers,
      title,
      message,
      NotificationType.Other,
      url
    )
    await this.sendPushNotification(receivers, title, message, url)
  }

  processNotificationText(input: string) {
    if (!input) return ''
    const removedTags = input.replace(/<[^>]*>/g, '')
    const decoded = he.decode(removedTags)

    return decoded
  }

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
        this.logger.error(
          `Failed to send push notification to user ${subscription.userId}: ${error.message ?? String(error)}`
        )

        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.prisma.pushSubscription.delete({
            where: { id: subscription.id }
          })
        }
      }
    })

    await Promise.allSettled(sendPromises)
  }
}
