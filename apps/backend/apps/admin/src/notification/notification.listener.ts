import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  MAX_DATE,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_HOUR
} from '@libs/constants'
import { NotificationScheduler } from './notification.scheduler'
import { NotificationService } from './notification.service'

const ASSIGNMENT_REMINDER = [
  { id: '1d', offset: -MILLISECONDS_PER_DAY },
  { id: '3h', offset: -3 * MILLISECONDS_PER_HOUR }
]

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationScheduler: NotificationScheduler
  ) {}

  private contestStartReminderJobId(contestId: number) {
    return `contest:${contestId}:start-reminder`
  }

  private assignmentDueReminderJobId(assignmentId: number, reminderId: string) {
    return `assignment:${assignmentId}:due-reminder:${reminderId}`
  }

  private everyAssignmentDueReminderJobId(assignmentId: number) {
    return ASSIGNMENT_REMINDER.map((reminder) =>
      this.assignmentDueReminderJobId(assignmentId, reminder.id)
    )
  }

  private calculateDelay(fireAt: Date, offset: number) {
    return fireAt.getTime() - Date.now() + offset
  }

  @OnEvent('notice.created')
  async handleNoticeCreated(payload: { noticeId: number }) {
    this.notificationService.notifyNoticeCreated(payload.noticeId)
  }

  @OnEvent('assignment.graded')
  async handleAssignmentGraded(payload: { assignmentId: number }) {
    this.notificationService.notifyAssignmentGraded(payload.assignmentId)
  }

  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: {
    assignmentId: number
    dueTime: Date
  }) {
    this.notificationService.notifyAssignmentCreated(payload.assignmentId)

    if (payload.dueTime.getTime() === MAX_DATE.getTime()) return

    const title = 'assignment-due-reminder'
    const data = { assignmentId: payload.assignmentId }

    const reminders = ASSIGNMENT_REMINDER.map((reminder) => {
      const jobId = this.assignmentDueReminderJobId(
        payload.assignmentId,
        reminder.id
      )
      const delay = this.calculateDelay(payload.dueTime, reminder.offset)
      if (delay <= 0) {
        return null
      }
      return this.notificationScheduler.scheduleJob(title, data, jobId, delay)
    }).filter(Boolean)

    await Promise.all(reminders)
  }

  @OnEvent('assignment.updated')
  async handleAssignmentUpdated(payload: {
    assignmentId: number
    dueTime: Date
  }) {
    const prevJobIds = this.everyAssignmentDueReminderJobId(
      payload.assignmentId
    )
    await Promise.all(
      prevJobIds.map((jobId) =>
        this.notificationScheduler.cancelScheduledJob(jobId)
      )
    )

    if (payload.dueTime.getTime() === MAX_DATE.getTime()) return

    const title = 'assignment-due-reminder'
    const data = { assignmentId: payload.assignmentId }

    const reminders = ASSIGNMENT_REMINDER.map((reminder) => {
      const jobId = this.assignmentDueReminderJobId(
        payload.assignmentId,
        reminder.id
      )
      const delay = this.calculateDelay(payload.dueTime, reminder.offset)
      if (delay <= 0) {
        return null
      }
      return this.notificationScheduler.scheduleJob(title, data, jobId, delay)
    }).filter(Boolean)

    await Promise.all(reminders)
  }

  @OnEvent('assignment.deleted')
  async handleAssignmentDeleted(assignmentId: number) {
    const jobIds = this.everyAssignmentDueReminderJobId(assignmentId)
    await Promise.all(
      jobIds.map((jobId) =>
        this.notificationScheduler.cancelScheduledJob(jobId)
      )
    )
  }

  @OnEvent('contest.created')
  async handleContestCreated(payload: { contestId: number; startTime: Date }) {
    const title = 'contest-start-reminder'
    const data = { contestId: payload.contestId }
    const jobId = this.contestStartReminderJobId(payload.contestId)
    const delay = this.calculateDelay(payload.startTime, -MILLISECONDS_PER_HOUR)

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
