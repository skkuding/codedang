import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { PlagiarismCheck } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import { EXCHANGE, SUBMISSION_KEY, CHECK_MESSAGE_TYPE } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import { CheckRequest } from './model/check-request'

@Injectable()
export class CheckPublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

  @Span()
  async publishCheckRequestMessage({
    check
  }: {
    check: PlagiarismCheck
  }): Promise<void> {
    const checkRequest = new CheckRequest(
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

    await this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, checkRequest, {
      messageId: check.id,
      type: CHECK_MESSAGE_TYPE,
      persistent: true
    })
    span.end()
  }
}
