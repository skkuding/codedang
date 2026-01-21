import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ContestRole, NotificationType } from '@prisma/client'
import * as he from 'he'
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
        'mailto:skkuding@gmail.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      )
    }
  }

  /**
   * 과제 채점이 완료되었을 때, 해당 과제가 속한 그룹의 구성원들에게 알림을 발송합니다.
   *
   * 1. 과제 정보를 조회하여 해당 그룹에 속한 모든 구성원을 수신자로 설정합니다.
   * 2. 수신자 전원의 알림함(Notification)에 알림 내역을 저장합니다.
   * 3. 수신자 중 푸시 알림을 구독(PushSubscription)한 사용자에게만 웹 푸시를 전송합니다.
   *
   * @param {number} assignmentId 과제 ID
   * @returns
   */
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

  /**
   * 과제가 생성되었을 때, 해당 과제가 속한 그룹의 구성원들에게 알림을 발송합니다.
   *
   * 1. 과제 정보를 조회하여 해당 그룹에 속한 모든 구성원을 수신자로 설정합니다.
   * 2. 수신자 전원의 알림함(Notification)에 알림 내역을 저장합니다.
   * 3. 수신자 중 푸시 알림을 구독(PushSubscription)한 사용자에게만 웹 푸시를 전송합니다.
   *
   * @param {number} assignmentId 과제 ID
   * @returns
   */
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

  /**
   * 과제 마감 임박 시(1일 전 또는 3시간 전), 해당 과제가 속한 그룹의 구성원들에게 알림을 발송합니다.
   *
   * 1. 과제 정보를 조회하여 해당 그룹에 속한 모든 구성원을 수신자로 설정합니다.
   * 2. 수신자 전원의 알림함(Notification)에 알림 내역을 저장합니다.
   * 3. 수신자 중 푸시 알림을 구독(PushSubscription)한 사용자에게만 웹 푸시를 전송합니다.
   *
   * @param {number} assignmentId 과제 ID
   * @returns
   */
  async notifyAssignmentDue(assignmentId: number) {
    const assignmentInfo = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        title: true,
        dueTime: true,
        endTime: true,
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
      (assignmentInfo.dueTime ?? assignmentInfo.endTime).getTime() -
        Date.now() >
      3 * MILLISECONDS_PER_HOUR
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

  /**
   * 대회가 시작되기 1시간 전, 해당 대회의 참가자들에게 알림을 발송합니다.
   *
   * 1. 대회 정보를 조회하여 해당 대회의 모든 참가자를 수신자로 설정합니다.
   * 2. 수신자 전원의 알림함(Notification)에 알림 내역을 저장합니다.
   * 3. 수신자 중 푸시 알림을 구독(PushSubscription)한 사용자에게만 웹 푸시를 전송합니다.
   *
   * @param {number} contestId 대회 ID
   * @returns
   */
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

  /**
   * 알림(Notification)을 생성하고, 수신자별 알림 기록(NotificationRecord)을 DB에 저장합니다.
   *
   * @param userIds 알림을 받을 사용자 ID 배열
   * @param title 알림 제목
   * @param message 알림 내용
   * @param type 알림 유형
   * @param url 관련 URL
   * @returns
   */
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
   * 새로운 공지가 생성되면, 모든 사용자들에게 알림을 발송합니다.
   *
   * 1. 코드당 서비스에 가입된 모든 사용자들을 수신자로 설정합니다.
   * 2. 수신자 전원의 알림함(Notification)에 알림 내역을 저장합니다.
   * 3. 수신자 중 푸시 알림을 구독(PushSubscription)한 사용자에게만 웹 푸시를 전송합니다.
   *
   * @param {number} noticeId 공지 ID
   * @returns
   */
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

  /**
   * HTML 형식이 포함된 문자열을 순수 텍스트(Plain Text)로 변환합니다.
   *
   * @param {string} input HTML 태그가 포함된 원본 문자열
   * @returns 태그 제거 및 엔티티 디코딩이 완료된 순수 텍스트
   */
  processNotificationText(input: string) {
    if (!input) return ''
    const removedTags = input.replace(/<[^>]*>/g, '')
    const decoded = he.decode(removedTags)

    return decoded
  }

  /**
   * 푸시 알림을 구독(PushSubscription)한 사용자들에게 실제 웹 푸시를 전송합니다.
   *
   * 1. 전달받은 사용자 ID 목록 중, DB에 유효한 PushSubscription 정보가 있는 사용자를 조회합니다.
   * 2. web-push 라이브러리를 사용하여 브라우저로 알림을 비동기 전송합니다.
   * 3. 전송 실패 시 오류 코드를 확인하여, 만료되거나 유효하지 않은 구독(404 Not Found, 410 Gone)인 경우 DB에서 해당 구독 정보를 삭제합니다.
   *
   * @param {number[]} userIds 수신 대상 사용자 ID 배열
   * @param {string} title 알림 제목
   * @param {string} message 알림 내용
   * @param {string} url 관련 URL
   * @returns
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
