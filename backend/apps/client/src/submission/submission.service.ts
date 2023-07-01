import { Injectable, type OnModuleInit } from '@nestjs/common'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import { type Problem, ResultStatus, type Submission } from '@prisma/client'
import { type ValidationError, validate } from 'class-validator'
import { ActionNotAllowedException, MessageFormatError } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { calculateTimeLimit } from './constants/cpuLimit.constants'
import { calculateMemoryLimit } from './constants/memoryLimit.constants'
import {
  CONSUME_CHANNEL,
  EXCHANGE,
  ORIGIN_HANDLER_NAME,
  PUBLISH_TYPE,
  RESULT_KEY,
  RESULT_QUEUE,
  SUBMISSION_KEY
} from './constants/rabbitmq.constants'
import { matchResultCode } from './constants/resultCode.constants'
import type { CreateSubmissionDto } from './dto/create-submission.dto'
import { JudgeRequestDto } from './dto/judge-request.dto'
import type { SubmissionResultMessage } from './dto/submission-result-message'
import type { SubmissionResultDTO } from './dto/submission-result.dto'
import { generateHash } from './hash/hash'

@Injectable()
export class SubmissionService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  onModuleInit() {
    if (process.env?.ENABLE_SUBSCRIBER === 'true') {
      this.amqpConnection.createSubscriber(
        async (msg: SubmissionResultMessage) => {
          try {
            await this.submissionResultHandler(msg)
          } catch (error) {
            if (error instanceof MessageFormatError) {
              return new Nack()
            } else {
              return new Nack()
            }
          }
        },
        {
          exchange: EXCHANGE,
          routingKey: RESULT_KEY,
          queue: RESULT_QUEUE,
          queueOptions: {
            channel: CONSUME_CHANNEL
          }
        },
        ORIGIN_HANDLER_NAME
      )
    }
  }

  async getSubmissionResults(
    submissionId: string
  ): Promise<SubmissionResultDTO> {
    const submissionResults = await this.prisma.submissionResult.findMany({
      where: {
        submissionId
      }
    })

    /*
     TODO: 점수 계산 로직 추가
    */
    const score = 100
    const passed =
      submissionResults.filter(
        (result) => result.result !== ResultStatus.Accepted
      ).length === 0
    const judgeFinished =
      submissionResults.filter(
        (result) => result.result === ResultStatus.Judging
      ).length === 0

    return {
      submissionResults,
      passed,
      judgeFinished,
      score
    }
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
    userId: number
  ): Promise<Submission & { submissionResultIds: { id: number }[] }> {
    const { languages } = await this.prisma.problem.findUnique({
      where: { id: createSubmissionDto.problemId },
      select: { languages: true }
    })

    if (!languages.includes(createSubmissionDto.language)) {
      throw new ActionNotAllowedException(
        `${createSubmissionDto.language}`,
        'problem'
      )
    }

    const submission: Submission = await this.prisma.submission.create({
      data: {
        id: generateHash(),
        ...createSubmissionDto,
        userId
      }
    })

    const submissionResultIds: { id: number }[] =
      await this.createSubmissionResult(submission.id, submission.problemId)

    await this.publishJudgeRequestMessage(submission)

    return {
      ...submission,
      submissionResultIds
    }
  }

  private async createSubmissionResult(
    submissionId: string,
    problemId: number
  ): Promise<{ id: number }[]> {
    const testcaseIds = await this.prisma.problemTestcase.findMany({
      where: {
        problemId
      },
      select: {
        id: true
      }
    })

    const submissionResults = testcaseIds.map((testcase) => {
      return {
        submissionId,
        problemTestcaseId: testcase.id,
        result: ResultStatus.Judging
      }
    })

    await this.prisma.submissionResult.createMany({
      data: submissionResults
    })

    return await this.prisma.submissionResult.findMany({
      where: {
        submissionId
      },
      select: {
        id: true
      }
    })
  }

  private async publishJudgeRequestMessage(
    submission: Submission
  ): Promise<void> {
    const problem: Partial<Problem> = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        timeLimit: true,
        memoryLimit: true
      }
    })

    const judgeRequest = new JudgeRequestDto(
      submission.code,
      submission.language,
      submission.problemId,
      calculateTimeLimit(submission.language, problem.timeLimit),
      calculateMemoryLimit(submission.language, problem.memoryLimit)
    )

    /*
      TODO: problem 단위가 아닌 testcase 단위로 채점하도록 변경
    */

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      persistent: true,
      messageId: submission.id,
      type: PUBLISH_TYPE
    })
  }

  async submissionResultHandler(msg: SubmissionResultMessage): Promise<void> {
    const validationError: ValidationError[] = await validate(msg)

    if (validationError.length > 0) {
      throw new MessageFormatError({ ...validationError })
    }

    const resultCode: ResultStatus = matchResultCode(msg.resultCode)
    const submissionId = msg.submissionId

    const judgeResults = msg.data.judgeResult.map((result) => {
      return {
        problemTestcaseId: parseInt(result.testcaseId.split(':')[1], 10),
        result: resultCode,
        submissionId
      }
    })

    await this.updateSubmissionResult(judgeResults)
  }

  private async updateSubmissionResult(
    judgeResults: {
      problemTestcaseId: number
      result: ResultStatus
      submissionId: string
    }[]
  ): Promise<void> {
    for (const result of judgeResults) {
      try {
        const id = await this.prisma.submissionResult
          .findFirst({
            where: {
              submissionId: result.submissionId,
              problemTestcaseId: result.problemTestcaseId
            },
            select: {
              id: true
            }
          })
          .then((result) => result.id)

        await this.prisma.submissionResult.update({
          where: {
            id
          },
          data: {
            result: result.result
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
