import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { PlagiarismCheck } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import { EXCHANGE, CHECK_KEY, SUBMISSION_KEY } from '@libs/constants'
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
      check.checkId,
      check.problemId,
      check.language,
      check.minTokens,
      check.checkPreviousSubmission,
      check.enableMerging,
      check.useJplagClustering
    )

    const span = this.traceService.startSpan(
      'publishCheckRequestMessage.publish'
    )

    span.setAttributes({ checkId: check.checkId })

    await this.amqpConnection.publish(EXCHANGE, CHECK_KEY, checkRequest, {
      messageId: check.checkId,
      persistent: true
    })
    span.end()
  }
}
