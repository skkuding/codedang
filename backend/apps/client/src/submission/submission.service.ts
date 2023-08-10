import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
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
import type { JudgerResponse } from './dto/judger-response.dto'

@Injectable()
export class SubmissionService implements OnModuleInit {
  private readonly logger = new Logger(SubmissionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  onModuleInit() {
    this.amqpConnection.createSubscriber(
      async (msg: JudgerResponse) => {
        try {
          await this.handleJudgerMessage(msg)
        } catch (error) {
          if (error instanceof MessageFormatError) {
            this.logger.error('Message format error', error)
            return new Nack()
          } else {
            this.logger.error('Unexpected error', error)
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

  async submitToProblem(
    submissionDto: CreateSubmissionDto,
    userId: number,
    problemId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id: problemId,
        groupId,
        exposeTime: {
          lt: new Date()
        }
      }
    })
    return await this.createSubmission(submissionDto, problem, userId)
  }

  async submitToContest(
    submissionDto: CreateSubmissionDto,
    userId: number,
    problemId: number,
    contestId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const now = new Date()

    const { contest } = await this.prisma.contestRecord.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId: contestId,
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
          problemId: problemId,
          contestId: contestId
        }
      },
      include: {
        problem: true
      }
    })

    return await this.createSubmission(submissionDto, problem, userId)
  }

  async submitToWorkbook(
    submissionDto: CreateSubmissionDto,
    userId: number,
    problemId: number,
    workbookId: number,
    groupId = OPEN_SPACE_ID
  ) {
    const { problem } = await this.prisma.workbookProblem.findUniqueOrThrow({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          problemId: problemId,
          workbookId: workbookId
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
    problem: Problem,
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

    const submission = await this.prisma.submission.create({
      data: {
        id: this.hash(),
        code: code.map((snippet) => ({ ...snippet })), // convert to plain object
        result: ResultStatus.Judging,
        userId,
        problemId: problem.id,
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
      else if (template[i].locked && template[i].text !== code[i].text)
        return false
    }
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

  hash() {
    return Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  }

  async publishJudgeRequestMessage(code: Snippet[], submission: Submission) {
    const problem = await this.prisma.problem.findUnique({
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

  async handleJudgerMessage(msg: JudgerResponse) {
    const validationError: ValidationError[] = await validate(msg)
    if (!validationError) {
      throw new MessageFormatError({ ...validationError })
    }

    const submissionId = msg.submissionId
    const resultStatus = Status(msg.resultCode)

    const results = msg.data.judgeResult.map((result) => {
      return {
        problemTestcaseId: parseInt(result.testcaseId.split(':')[1], 10),
        result: Status(result.resultCode),
        cpuTime: BigInt(result.cpuTime),
        memoryUsage: result.memory
      }
    })

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

    // FIXME: 현재 코드는 message 하나에 특정 problem에 대한 모든 테스트케이스의 채점 결과가 전송된다고 가정하고, 이를 받아서 submission의 overall result를 업데이트합니다.
    //        테스트케이스별로 DB 업데이트가 이루어진다면 아래 코드를 수정해야 합니다.
    await this.prisma.submission.update({
      where: {
        id
      },
      data: {
        result: resultStatus
      }
    })
  }

  // FIXME: Workbook 구분
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
      (await this.hasPassedProblem(userId, { problemId }))
    ) {
      return submission.submissionResult
    }
    throw new ForbiddenAccessException(
      "You must pass the problem first to browse other people's submissions"
    )
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
