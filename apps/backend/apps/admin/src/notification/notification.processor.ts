import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type { Job } from 'bullmq'
import type { NotificationSchedulerData } from './interface/notification.interface'
import { NotificationService } from './notification.service'

@Processor('notification')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super()
  }

  async process(job: Job<NotificationSchedulerData>) {
    switch (job.name) {
      case 'contest-start-reminder': {
        const { contestId } = job.data
        await this.notificationService.notifyContestStartingSoon(contestId!)
        return { ok: true }
      }
      case 'assignment-due-reminder': {
        const { assignmentId } = job.data
        await this.notificationService.notifyAssignmentDue(assignmentId!)
        return { ok: true }
      }
    }
  }
}
