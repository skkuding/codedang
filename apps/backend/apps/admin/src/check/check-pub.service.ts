import { Injectable, Logger } from '@nestjs/common'
import { CheckRequest } from '@prisma/client'
import { Span } from 'nestjs-otel'
import { AMQPService } from '@libs/amqp'
import { CHECK_MESSAGE_TYPE, CHECK_EXCHANGE, CHECK_KEY } from '@libs/constants'
import { CheckRequestMsg } from './model/check-request'

@Injectable()
export class CheckPublicationService {
  private readonly logger = new Logger(CheckPublicationService.name)

  constructor(private readonly amqpService: AMQPService) {}

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

    /*await this.amqpService.publishCheckRequestMessage(
      checkRequest
    )*/

    /*await this.amqpConnection.publish(CHECK_EXCHANGE, CHECK_KEY, checkRequest, {
      messageId: String(check.id),
      type: CHECK_MESSAGE_TYPE,
      persistent: true
    })*/
  }
}
