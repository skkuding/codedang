import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { NotificationService } from './notification.service'

@Processor('contest')
@Injectable()
export class ContestNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(ContestNotificationProcessor.name)

  constructor(private readonly notificationService: NotificationService) {
    super()
  }

  async process(job: Job<{ contestId: number }>) {
    switch (job.name) {
      case 'contest-start-reminder': {
        const { contestId } = job.data
        await this.notificationService.notifyContestStartingSoon(contestId)
        return { ok: true }
      }
    }
  }
}
