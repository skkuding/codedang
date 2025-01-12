import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { Submission } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import {
  EXCHANGE,
  JUDGE_MESSAGE_TYPE,
  RUN_MESSAGE_TYPE,
  SUBMISSION_KEY,
  USER_TESTCASE_MESSAGE_TYPE
} from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Snippet } from './class/create-submission.dto'
import { JudgeRequest, UserTestcaseJudgeRequest } from './class/judge-request'

@Injectable()
export class SubmissionPublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

  @Span()
  async publishJudgeRequestMessage(
    code: Snippet[],
    submission: Submission,
    isTest = false, // Open Testcase 채점 여부
    isUserTest = false, // User Testcase 채점 여부
    userTestcases?: { id: number; in: string; out: string }[] // User Testcases
  ) {
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

    const judgeRequest = isUserTest
      ? new UserTestcaseJudgeRequest(
          code,
          submission.language,
          problem,
          userTestcases!
        )
      : new JudgeRequest(code, submission.language, problem)

    const span = this.traceService.startSpan(
      'publishJudgeRequestMessage.publish'
    )
    span.setAttributes({ submissionId: submission.id })

    await this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: String(submission.id),
      persistent: true,
      type: isTest
        ? RUN_MESSAGE_TYPE
        : isUserTest
          ? USER_TESTCASE_MESSAGE_TYPE
          : JUDGE_MESSAGE_TYPE
    })
    span.end()
  }
}
