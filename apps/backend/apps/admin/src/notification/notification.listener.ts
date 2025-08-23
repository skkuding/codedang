import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NotificationService } from './notification.service'

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('assignment.graded')
  async handleAssignmentGraded(payload: {
    assignmentId: number
    userId: number
  }) {
    this.notificationService.notifyAssignmentGraded(payload.assignmentId)
  }

  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: { assignmentId: number }) {
    this.notificationService.notifyAssignmentCreated(payload.assignmentId)
  }
}
