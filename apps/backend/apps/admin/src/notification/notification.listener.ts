import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import type { ContestStartReminderData } from './interface/notification.interface'
import { NotificationScheduler } from './notification.scheduler'
import { NotificationService } from './notification.service'

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationScheduler: NotificationScheduler
  ) {}

  private contestStartReminderJobId(contestId: number) {
    return `contest:${contestId}:start-reminder`
  }

  @OnEvent('assignment.graded')
  async handleAssignmentGraded(payload: {
    assignmentId: number
    userId: number
  }) {
    this.notificationService.notifyAssignmentGraded(
      payload.assignmentId,
      payload.userId
    )
  }

  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: { assignmentId: number }) {
    this.notificationService.notifyAssignmentCreated(payload.assignmentId)
  }

  @OnEvent('contest.created')
  async handleContestCreated(payload: { contestId: number; startTime: Date }) {
    const title = 'contest-start-reminder'
    const data: ContestStartReminderData = { contestId: payload.contestId }
    const jobId = this.contestStartReminderJobId(payload.contestId)
    const fireAt = new Date(payload.startTime.getTime() - 60 * 60 * 1000)
    const delay = fireAt.getTime() - Date.now()

    if (delay <= 0) {
      console.log(
        `[Scheduler] Skipping contest ${payload.contestId} - too soon`
      )
      return // 이미 1시간 이내면 스킵
    }

    this.notificationScheduler.scheduleJob(title, data, jobId, delay)
  }

  @OnEvent('contest.updated')
  async handleContestUpdated(payload: { contestId: number; startTime: Date }) {
    // 기존 알림 취소
    this.notificationScheduler.cancelScheduledJob(
      this.contestStartReminderJobId(payload.contestId)
    )

    this.handleContestCreated(payload)
  }

  @OnEvent('contest.deleted')
  async handleContestDeleted(contestId: number) {
    this.notificationScheduler.cancelScheduledJob(
      this.contestStartReminderJobId(contestId)
    )
  }
}
