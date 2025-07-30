import { Injectable } from '@nestjs/common'
import { NotificationType } from '@prisma/client'
import { PrismaService } from '@libs/prisma'
import { AssignmentService } from '@admin/assignment/assignment.service'

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: AssignmentService
  ) {}

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

      this.saveNotification(
        [userId],
        title,
        message,
        NotificationType.Assignment
      )
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

    const recievers =
      assignmentInfo?.group.userGroup.map((user) => user.userId) ?? []

    const title = assignmentInfo?.group.groupName ?? 'Assignment'
    const message = `A new assignment "${assignmentInfo?.title ?? ''}" has been created.`

    this.saveNotification(
      recievers,
      title,
      message,
      NotificationType.Assignment
    )
  }

  private async saveNotification(
    recievers: number[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.Other,
    url?: string
  ) {
    if (recievers.length === 0) {
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

    const notificationRecords = recievers.map((userId) => ({
      notificationId: notification.id,
      userId
    }))

    await this.prisma.notificationRecord.createMany({
      data: notificationRecords
    })
  }
}
