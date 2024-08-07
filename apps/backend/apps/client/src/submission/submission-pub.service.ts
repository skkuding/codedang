import { Injectable, Logger } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { Submission } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import { EXCHANGE, PUBLISH_TYPE, SUBMISSION_KEY } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Snippet } from './class/create-submission.dto'
import { JudgeRequest } from './class/judge-request'

@Injectable()
export class SubmissionPublicationService {
  private readonly logger = new Logger(SubmissionPublicationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

  @Span()
  async publishJudgeRequestMessage(code: Snippet[], submission: Submission) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        id: true,
        timeLimit: true,
        memoryLimit: true
      }
    })

    if (!problem) {
      throw new EntityNotExistException('problem')
    }

    const judgeRequest = new JudgeRequest(code, submission.language, problem)

    const span = this.traceService.startSpan(
      'publishJudgeRequestMessage.publish'
    )
    span.setAttributes({ submissionId: submission.id })

    await this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: String(submission.id),
      persistent: true,
      type: PUBLISH_TYPE
    })
    span.end()
  }
}
