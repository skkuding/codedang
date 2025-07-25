import { Injectable } from '@nestjs/common'
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

      this.saveNotification([userId], title, message)
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

    this.saveNotification(recievers, title, message)
  }

  private async saveNotification(
    recievers: number[],
    title: string,
    message: string
  ) {
    console.log('Notification saved')
    console.log('Recievers:', recievers)
    console.log('Title:', title)
    console.log('Message:', message)
  }
}
