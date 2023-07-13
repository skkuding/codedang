import { Injectable, type OnModuleInit } from '@nestjs/common'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import {
  ResultStatus,
  type Submission,
  type SubmissionResult,
  type Language,
  type Problem
} from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { type ValidationError, validate } from 'class-validator'
import { OPEN_SPACE_ID, Status } from '@libs/constants'
import {
  CONSUME_CHANNEL,
  EXCHANGE,
  ORIGIN_HANDLER_NAME,
  PUBLISH_TYPE,
  RESULT_KEY,
  RESULT_QUEUE,
  SUBMISSION_KEY
} from '@libs/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  ForbiddenAccessException,
  MessageFormatError
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  type CreateSubmissionDto,
  type Snippet,
  Template
} from './dto/create-submission.dto'
import { JudgeRequest } from './dto/judge-request.class'
import type { SubmissionResultMessage } from './dto/submission-result.dto'
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
            await this.handleJudgerResponse(msg)
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

  async submitToProblem(
    submissionDto: CreateSubmissionDto,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id: submissionDto.problemId,
        groupId,
        exposeTime: {
          lt: new Date()
        }
      },
      select: { languages: true, template: true }
    })
    return await this.createSubmission(submissionDto, problem, userId)
  }

  async submitToContest(
    submissionDto: CreateSubmissionDto,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const now = new Date()

    const { contest } = await this.prisma.contestRecord.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId: submissionDto.contestId,
          userId
        }
      },
      select: {
        contest: {
          select: {
            groupId: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })
    if (
      contest.groupId !== groupId ||
      contest.startTime > now ||
      contest.endTime <= now
    ) {
      throw new ActionNotAllowedException('submission', 'contest')
    }

    const { problem } = await this.prisma.contestProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          problemId: submissionDto.problemId,
          contestId: submissionDto.contestId
        }
      },
      include: {
        problem: true
      }
    })
    if (problem.exposeTime >= now) {
      throw new EntityNotExistException('problem')
    }

    return await this.createSubmission(submissionDto, problem, userId)
  }

  async submitToWorkbook(
    submissionDto: CreateSubmissionDto,
    userId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const { problem } = await this.prisma.workbookProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          problemId: submissionDto.problemId,
          workbookId: submissionDto.workbookId
        }
      },
      include: {
        problem: true
      }
    })
    if (problem.groupId !== groupId || problem.exposeTime >= new Date()) {
      throw new EntityNotExistException('problem')
    }

    return await this.createSubmission(submissionDto, problem, userId)
  }

  async createSubmission(
    submissionDto: CreateSubmissionDto,
    problem: Partial<Problem>,
    userId: number
  ) {
    if (!problem.languages.includes(submissionDto.language)) {
      throw new ActionNotAllowedException(
        `Submission in ${submissionDto.language}`,
        'problem'
      )
    }
    const { code, ...data } = submissionDto
    if (
      !this.isValidCode(
        code,
        submissionDto.language,
        plainToInstance(Template, problem.template)
      )
    ) {
      throw new ActionNotAllowedException('template modification', 'problem')
    }

    const submission: Submission = await this.prisma.submission.create({
      data: {
        id: generateHash(), // TODO: generate hash 구분
        code: JSON.stringify(code),
        result: ResultStatus.Judging,
        userId,
        ...data
      }
    })
    await this.publishJudgeRequestMessage(code, submission)

    return submission
  }

  isValidCode(code: Snippet[], language: Language, templates: Template[]) {
    const template = templates.find((code) => code.language === language)?.code
    if (!template || template.length === 0) return true

    if (template.length !== code.length) return false
    template.sort(this.snippetOrderCompare)
    code.sort(this.snippetOrderCompare)

    for (let i = 0; i < template.length; i++) {
      if (template[i].id !== code[i].id) return false
      else if (template[i].readonly && template[i].text !== code[i].text)
        return false
    } // TODO: 그냥 대체할까?
    return true
  }

  snippetOrderCompare(a: Snippet, b: Snippet) {
    if (a.id < b.id) {
      return -1
    } else if (a.id > b.id) {
      return 1
    }
    return 0
  }

  private async publishJudgeRequestMessage(
    code: Snippet[],
    submission: Submission
  ) {
    const problem = await this.prisma.problem.findUniqueOrThrow({
      where: { id: submission.problemId },
      select: {
        id: true,
        timeLimit: true,
        memoryLimit: true
      }
    })
    const judgeRequest = new JudgeRequest(code, submission.language, problem)
    // TODO: problem 단위가 아닌 testcase 단위로 채점하도록 iris 수정

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: submission.id,
      persistent: true,
      type: PUBLISH_TYPE
    })
  }

  async handleJudgerResponse(msg: SubmissionResultMessage) {
    console.log(msg.data.judgeResult) // TODO: Do we need this?

    const validationError: ValidationError[] = await validate(msg)
    if (validationError.length > 0) {
      throw new MessageFormatError({ ...validationError })
    }

    const resultStatus = Status(msg.resultCode)
    const submissionId = msg.submissionId

    const results = msg.data.judgeResult.map((result) => {
      return {
        problemTestcaseId: parseInt(result.testcaseId.split(':')[1], 10),
        result: Status(result.resultCode),
        cpuTime: BigInt(result.cpuTime),
        memoryUsage: result.memory
      }
    })

    console.log(results) // TODO: Do we need this?
    await this.updateSubmissionResult(submissionId, resultStatus, results)
  }

  async updateSubmissionResult(
    id: string,
    resultStatus: ResultStatus,
    results: Partial<SubmissionResult>[]
  ) {
    await Promise.all(
      results.map(
        async (result) =>
          await this.prisma.submissionResult.create({
            data: {
              submission: {
                connect: { id }
              },
              problemTestcase: {
                connect: { id: result.problemTestcaseId }
              },
              result: result.result,
              cpuTime: result.cpuTime,
              memoryUsage: result.memoryUsage
            }
          })
      )
    )

    await this.prisma.submission.update({
      where: {
        id
      },
      data: {
        result: resultStatus
      }
    })
  }

  async hasPassedProblem(
    userId: number,
    where: { problemId: number; contestId?: number }
  ): Promise<boolean> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        ...where,
        userId
      },
      select: { result: true }
    })

    return submissions.some(
      (submission) => submission.result === ResultStatus.Accepted
    )
  }

  async getSubmissions(
    problemId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Submission>[]> {
    await this.prisma.problem.findFirstOrThrow({
      where: {
        id: problemId,
        groupId,
        exposeTime: {
          lt: new Date()
        }
      }
    })

    return await this.prisma.submission.findMany({
      where: {
        problemId
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true
      }
    })
  }

  async getSubmission(
    id: string,
    problemId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<SubmissionResult[]> {
    await this.prisma.problem.findFirstOrThrow({
      where: {
        id: problemId,
        groupId,
        exposeTime: {
          lt: new Date()
        }
      }
    })

    const submission = await this.prisma.submission.findFirstOrThrow({
      where: {
        id,
        problemId
      },
      select: {
        userId: true,
        submissionResult: true
      }
    })
    if (
      submission.userId === userId ||
      this.hasPassedProblem(userId, { problemId })
    ) {
      return submission.submissionResult
    }
    throw new ForbiddenAccessException(
      "You must pass the problem first to browse other people's submissions"
    )
  }

  async getContestSubmissions(
    problemId: number,
    contestId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Submission>[]> {
    await this.prisma.contestRecord.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId,
          userId
        }
      }
    })
    await this.prisma.contestProblem.findFirstOrThrow({
      where: {
        problem: {
          id: problemId,
          groupId
        },
        contestId
      }
    })

    return await this.prisma.submission.findMany({
      where: {
        problemId,
        contestId
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true
      }
    })
  }

  async getContestSubmission(
    id: string,
    problemId: number,
    contestId: number,
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<SubmissionResult[]> {
    const now = new Date()
    const { contest } = await this.prisma.contestRecord.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId,
          userId
        }
      },
      select: {
        contest: {
          select: {
            groupId: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })
    if (contest.groupId !== groupId) {
      throw new EntityNotExistException('contest')
    }

    const submission = await this.prisma.submission.findFirstOrThrow({
      where: {
        id,
        problemId,
        contestId
      },
      select: {
        userId: true,
        submissionResult: true
      }
    })

    if (
      contest.startTime <= now &&
      contest.endTime > now &&
      submission.userId !== userId
    ) {
      throw new ForbiddenAccessException(
        "Contest should end first before you browse other people's submissions"
      )
    }
    return submission.submissionResult
  }
}
