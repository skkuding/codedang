import { Injectable, Logger } from '@nestjs/common'
import { CheckRequest } from '@prisma/client'
import { Span } from 'nestjs-otel'
import { CheckAMQPService } from '@libs/amqp'
import { CheckRequestMsg } from './model/check-request'

@Injectable()
export class CheckPublicationService {
  private readonly logger = new Logger(CheckPublicationService.name)

  constructor(private readonly amqpService: CheckAMQPService) {}

  @Span()
  async publishCheckRequestMessage({
    check
  }: {
    check: CheckRequest
  }): Promise<void> {
    const checkRequest = new CheckRequestMsg(
      check.problemId,
      check.language,
      check.minTokens,
      check.enableMerging,
      check.useJplagClustering,
      check.assignmentId ? check.assignmentId : undefined,
      check.contestId ? check.contestId : undefined,
      check.workbookId ? check.workbookId : undefined
    )

    await this.amqpService.publishCheckRequestMessage(check.id, checkRequest)
  }
}
