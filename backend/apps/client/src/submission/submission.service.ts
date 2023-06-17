import { Injectable, type OnModuleInit } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import {
  CONSUME_CHANNEL,
  EXCHANGE,
  RESULT_KEY,
  RESULT_QUEUE,
  SUBMISSION_KEY
} from './constants/rabbitmq.constants'
import { type ValidationError, validate } from 'class-validator'
import {
  type Problem,
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import { MessageFormatError } from '@client/common/exception/business.exception'
import { JudgeRequestDto } from './dto/judge-request.dto'
import type { CreateSubmissionDto } from './dto/create-submission.dto'
import { UpdateSubmissionResultData } from './dto/update-submission-result.dto'
import type { SubmissionResultMessage } from './dto/submission-result-message'
import { generateHash } from './hash/hash'
import { calculateTimeLimit } from './constants/cpuLimit.constants'
import { calculateMemoryLimit } from './constants/memoryLimit.constants'
import { matchResultCode } from './constants/resultCode.constants'

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
              console.log(
                'Dont requeue. message format error: %s with %s',
                msg,
                error
              )
              return new Nack()
            } else {
              console.log(
                'Requeue submission-result message: %s with %s',
                msg,
                error
              )
              return new Nack(true)
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
        'original Handler Name'
      )
    }
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
    userId: number
  ) {
    const { languages } = await this.prisma.problem.findUnique({
      where: { id: createSubmissionDto.problemId },
      select: { languages: true }
    })

    if (!languages.includes(createSubmissionDto.language)) {
      throw new Error(`${createSubmissionDto.language} is not allowed`)
    }

    const submission: Submission = await this.prisma.submission.create({
      data: {
        id: generateHash(),
        ...createSubmissionDto,
        userId
      }
    })

    const submissionResultIds = await this.createSubmissionResult(
      submission.id,
      submission.problemId
    )

    await this.publishJudgeRequestMessage(submission, submissionResultIds)

    return submission
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
    submission: Submission,
    submissionResultIds: { id: number }[]
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

    submissionResultIds.forEach((submissionResultId) => {
      this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
        persistent: true,
        messageId: submissionResultId.toString(),
        type: 'Judge'
      })
    })
  }

  public async submissionResultHandler(msg: SubmissionResultMessage) {
    const validationError: ValidationError[] = await validate(msg)

    if (validationError.length > 0) {
      throw new MessageFormatError({ ...validationError })
    }

    const resultCode: ResultStatus = matchResultCode(msg.resultCode)
    const data = new UpdateSubmissionResultData(resultCode)

    // switch (resultCode) {
    //   case ResultStatus.ServerError:
    //   case ResultStatus.CompileError:
    //     data.errorMessage = msg.error
    //     break
    //   default:
    //     data.acceptedNum = msg.data.acceptedNum
    //     data.totalTestcase = msg.data.totalTestcase
    //     data.judgeResult = JSON.stringify(msg.data.judgeResult)
    // }

    const submissionResultId: number = parseInt(msg.submissionResultId, 10)
    await this.updateSubmissionResult(submissionResultId, data)

    //TODO: server push하는 코드(user id에게)
  }

  private async updateSubmissionResult(
    id: number,
    data: UpdateSubmissionResultData
  ): Promise<SubmissionResult> {
    return await this.prisma.submissionResult.update({
      where: {
        id
      },
      data: {
        ...data
      }
    })
  }
}
