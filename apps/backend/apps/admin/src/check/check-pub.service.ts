import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { CheckRequest } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import { CHECK_MESSAGE_TYPE, CHECK_EXCHANGE, CHECK_KEY } from '@libs/constants'
import { CheckRequestMsg } from './model/check-request'

@Injectable()
export class CheckPublicationService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

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
      check.checkPreviousSubmission,
      check.enableMerging,
      check.useJplagClustering,
      check.assignmentId ? check.assignmentId : undefined,
      check.contestId ? check.contestId : undefined,
      check.workbookId ? check.workbookId : undefined
    )

    const span = this.traceService.startSpan(
      'publishCheckRequestMessage.publish'
    )

    span.setAttributes({ checkId: check.id })

    await this.amqpConnection.publish(CHECK_EXCHANGE, CHECK_KEY, checkRequest, {
      messageId: check.id,
      type: CHECK_MESSAGE_TYPE,
      persistent: true
    })
    span.end()
  }
}
