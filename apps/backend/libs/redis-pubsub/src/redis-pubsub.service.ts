import { Injectable } from '@nestjs/common'
import type { OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ResultStatus } from '@prisma/client'
import { createClient } from 'redis'
import type { PubSubSubmissionResult } from './testcase-result.interface'

@Injectable()
export class RedisPubSubService implements OnModuleInit {
  private client

  constructor(private readonly config: ConfigService) {
    this.client = createClient({
      socket: {
        host: this.config.get('REDIS_HOST'),
        port: this.config.get('REDIS_PUBSUB_PORT')
      }
    })
  }

  async onModuleInit() {
    await this.client.connect()
  }

  async publishSubmissionResult(
    submissionId: number,
    result: {
      result: ResultStatus
      testcaseResult: {
        submissionId: number
        problemTestcaseId: number
        result: ResultStatus
        cpuTime: bigint
        memoryUsage: number
      }
    }
  ) {
    //convert bigint to string for redis
    const serializedResult: PubSubSubmissionResult = {
      submissionId,
      result: {
        ...result.testcaseResult,
        cpuTime: result.testcaseResult.cpuTime.toString()
      }
    }

    await this.client.publish(
      this.submissionTestcaseResultChannel(submissionId),
      JSON.stringify(serializedResult)
    )
  }

  async subscribeToSubmission(
    submissionId: number,
    callback: (data: PubSubSubmissionResult) => void
  ) {
    const subscriber = this.client.duplicate()
    await subscriber.connect()

    await subscriber.subscribe(
      this.submissionTestcaseResultChannel(submissionId),
      (message) => callback(JSON.parse(message))
    )

    return subscriber
  }

  submissionTestcaseResultChannel(submissionId: number) {
    return `submission:${submissionId}`
  }
}
