import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { UnprocessableDataException } from '@libs/exception'
import type { NotificationSchedulerData } from './interface/notification.interface'

@Injectable()
export class NotificationScheduler {
  constructor(@InjectQueue('notification') private readonly queue: Queue) {}

  async scheduleJob(
    title: string,
    data: NotificationSchedulerData, // 추후 다른 작업 생성 시 필요한 데이터를 인터페이스로 정의
    jobId: string,
    delay: number
  ) {
    if (data.assignmentId === undefined && data.contestId === undefined) {
      throw new UnprocessableDataException('Invalid notification data')
    }

    const job = await this.queue.add(title, data, {
      jobId,
      delay,
      removeOnComplete: true,
      attempts: 3
    })

    console.log(`[Scheduler] Successfully created job:`, {
      jobId: job.id,
      jobName: job.name,
      delay: job.delay,
      timestamp: job.timestamp,
      queueName: this.queue.name
    })
  }

  async cancelScheduledJob(jobId: string) {
    const job = await this.queue.getJob(jobId)
    if (job) await job.remove()
  }
}
