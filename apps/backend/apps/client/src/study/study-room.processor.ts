import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import {
  StudyRoomService,
  STUDY_ROOM_QUEUE,
  JOB_RECONNECT_EXPIRE
} from './study-room.service'

@Processor(STUDY_ROOM_QUEUE)
export class StudyRoomProcessor extends WorkerHost {
  private readonly logger = new Logger(StudyRoomProcessor.name)

  constructor(private readonly studyRoomService: StudyRoomService) {
    super()
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB_RECONNECT_EXPIRE:
        await this.studyRoomService.handleReconnectExpiry(job.data)
        break
      default:
        this.logger.warn(
          `Unknown job name: ${job.name}`,
          JSON.stringify(job.data)
        )
    }
  }
}
