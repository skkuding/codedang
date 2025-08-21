import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class ContestNotificationScheduler {
  constructor(@InjectQueue('contest') private readonly queue: Queue) {}

  private jobId(contestId: number) {
    return `contest:${contestId}:start-reminder`
  }

  async scheduleStartReminder(contestId: number, startTime: Date) {
    const fireAt = new Date(startTime.getTime() - 60 * 60 * 1000)
    const delay = fireAt.getTime() - Date.now()

    if (delay <= 0) {
      console.log(`[Scheduler] Skipping contest ${contestId} - too soon`)
      return // 이미 1시간 이내면 스킵
    }

    const job = await this.queue.add(
      'contest-start-reminder',
      { contestId },
      {
        jobId: this.jobId(contestId),
        delay,
        removeOnComplete: true,
        attempts: 3
      }
    )

    console.log(`[Scheduler] Successfully created job:`, {
      jobId: job.id,
      jobName: job.name,
      delay: job.delay,
      timestamp: job.timestamp,
      queueName: this.queue.name
    })
  }

  async cancelStartReminder(contestId: number) {
    const job = await this.queue.getJob(this.jobId(contestId))
    if (job) await job.remove()
  }

  async rescheduleStartReminder(contestId: number, startTime: Date) {
    await this.cancelStartReminder(contestId)
    await this.scheduleStartReminder(contestId, startTime)
  }
}
