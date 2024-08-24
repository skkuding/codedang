import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import {
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import { expect } from 'chai'
import * as sinon from 'sinon'
import {
  CONSUME_CHANNEL,
  EXCHANGE,
  ORIGIN_HANDLER_NAME,
  RESULT_KEY,
  RESULT_QUEUE,
  Status
} from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { contestRecord } from '../mock/contestRecord.mock'
import { submissions } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
import { SubmissionSubscriptionService } from '../submission-sub.service'

const judgeResult = {
  testcaseId: '1',
  resultCode: 1,
  cpuTime: 100000,
  realTime: 120000,
  memory: 10000000,
  signal: 0,
  exitCode: 0,
  errorCode: 0
}

const msg = {
  resultCode: 1,
  submissionId: 1,
  error: '',
  judgeResult
}

const submission: Submission & { submissionResult: SubmissionResult[] } = {
  ...submissions[0],
  codeSize: 1000,
  submissionResult: [submissionResults[0], submissionResults[1]],
  score: 100
}

const contestSubmission = {
  ...submission,
  contestId: 1
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFunc = (...args: object[]) => []

const db = {
  submission: {
    findUnique: mockFunc,
    update: mockFunc,
    findFirst: mockFunc
  },
  submissionResult: {
    findFirstOrThrow: mockFunc,
    updateMany: mockFunc,
    update: mockFunc
  },
  contestRecord: {
    findUniqueOrThrow: mockFunc,
    update: mockFunc
  },
  contestProblem: {
    findFirstOrThrow: mockFunc
  },
  problem: {
    update: mockFunc
  }
}

describe('SubmissionSubscriptionService', () => {
  let service: SubmissionSubscriptionService
  let amqpConnection: AmqpConnection

  const sandbox = sinon.createSandbox()

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionSubscriptionService,
        {
          provide: PrismaService,
          useValue: db
        },
        ConfigService,
        {
          provide: AmqpConnection,
          useFactory: () => ({
            createSubscriber: () => []
          })
        }
      ]
    }).compile()

    service = module.get<SubmissionSubscriptionService>(
      SubmissionSubscriptionService
    )
    amqpConnection = module.get<AmqpConnection>(AmqpConnection)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('onModuleInit', () => {
    it('should create amqpConenction', () => {
      const amqpSpy = sandbox.stub(amqpConnection, 'createSubscriber')

      service.onModuleInit()

      expect(
        amqpSpy.calledOnceWith(
          sinon.match.func,
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
      ).to.be.true
    })
  })

  describe('validateJudgerResponse', () => {
    it('should return JudgerResponse', async () => {
      const result = await service.validateJudgerResponse(msg)

      expect(result).to.be.deep.equal(msg)
    })

    it('should throw ValidationError', async () => {
      const invalidMsg = {
        resultCode: 'a',
        submissionId: 1,
        error: '',
        judgeResult
      }

      await expect(service.validateJudgerResponse(invalidMsg)).to.be.rejected
    })
  })

  describe('handleJudgerMessage', () => {
    it('should resolve', async () => {
      const spy = sandbox.stub(service, 'updateTestcaseJudgeResult').resolves()

      await expect(service.handleJudgerMessage(msg)).not.to.be.rejected
      expect(
        spy.calledOnceWithExactly({
          submissionId: msg.submissionId,
          problemTestcaseId: parseInt(
            msg.judgeResult.testcaseId.split(':')[1],
            10
          ),
          result: Status(msg.judgeResult.resultCode),
          cpuTime: BigInt(msg.judgeResult.cpuTime),
          memoryUsage: msg.judgeResult.memory
        })
      ).to.be.true
    })

    it('should call handleJudgeError when ServerError detected', async () => {
      const handlerSpy = sandbox.stub(service, 'handleJudgeError').resolves()
      const updateSpy = sandbox
        .stub(service, 'updateTestcaseJudgeResult')
        .resolves()
      const serverErrMsg = {
        resultCode: 9,
        submissionId: 1,
        error: '',
        judgeResult
      }

      await service.handleJudgerMessage(serverErrMsg)
      expect(handlerSpy.calledOnceWith(ResultStatus.ServerError, serverErrMsg))
        .to.be.true
      expect(updateSpy.notCalled).to.be.true
    })

    it('should call handleJudgeError when CompileError detected', async () => {
      const handlerSpy = sandbox.stub(service, 'handleJudgeError').resolves()
      const updateSpy = sandbox
        .stub(service, 'updateTestcaseJudgeResult')
        .resolves()
      const serverErrMsg = {
        resultCode: 6,
        submissionId: 1,
        error: '',
        judgeResult
      }

      await service.handleJudgerMessage(serverErrMsg)
      expect(handlerSpy.calledOnceWith(ResultStatus.CompileError, serverErrMsg))
        .to.be.true
      expect(updateSpy.notCalled).to.be.true
    })
  })

  describe('handleJudgeError', () => {
    it('should handle ServerError', async () => {
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(submissions[0])
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const updateManySpy = sandbox
        .stub(db.submissionResult, 'updateMany')
        .resolves()
      const serverErrMsg = {
        resultCode: 8,
        submissionId: 1,
        error: '',
        judgeResult
      }

      await expect(
        service.handleJudgeError(ResultStatus.ServerError, serverErrMsg)
      ).to.be.rejectedWith(UnprocessableDataException)

      expect(
        findSpy.calledOnceWith({
          where: {
            id: serverErrMsg.submissionId,
            result: ResultStatus.Judging
          },
          select: {
            id: true
          }
        })
      ).to.be.true
      expect(
        updateSpy.calledOnceWith({
          where: {
            id: serverErrMsg.submissionId
          },
          data: {
            result: ResultStatus.ServerError
          }
        })
      ).to.be.true
      expect(
        updateManySpy.calledOnceWith({
          where: {
            submissionId: serverErrMsg.submissionId
          },
          data: {
            result: ResultStatus.ServerError
          }
        })
      ).to.be.true
    })

    it('should handle CompileError', async () => {
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(submissions[0])
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const updateManySpy = sandbox
        .stub(db.submissionResult, 'updateMany')
        .resolves()
      const serverErrMsg = {
        resultCode: 6,
        submissionId: 1,
        error: '',
        judgeResult
      }

      await service.handleJudgeError(ResultStatus.CompileError, serverErrMsg)

      expect(
        findSpy.calledOnceWith({
          where: {
            id: serverErrMsg.submissionId,
            result: ResultStatus.Judging
          },
          select: {
            id: true
          }
        })
      ).to.be.true
      expect(
        updateSpy.calledOnceWith({
          where: {
            id: serverErrMsg.submissionId
          },
          data: {
            result: ResultStatus.CompileError
          }
        })
      ).to.be.true
      expect(
        updateManySpy.calledOnceWith({
          where: {
            submissionId: serverErrMsg.submissionId
          },
          data: {
            result: ResultStatus.CompileError
          }
        })
      ).to.be.true
    })

    it('should return when already handled error arrived', async () => {
      sandbox.stub(db.submission, 'findUnique').resolves(undefined)
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const updateManySpy = sandbox
        .stub(db.submissionResult, 'updateMany')
        .resolves()

      expect(updateSpy.notCalled).to.be.true
      expect(updateManySpy.notCalled).to.be.true
    })
  })

  describe('updateSubmissionResult', () => {
    it('should resolve', async () => {
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(submission)
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const submissionScoreSpy = sandbox
        .stub(service, 'calculateSubmissionScore')
        .resolves()
      const problemScoreSpy = sandbox
        .stub(service, 'calculateProblemScore')
        .resolves()
      const acceptSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()

      await expect(service.updateSubmissionResult(1)).not.to.be.rejected
      expect(
        findSpy.calledOnceWith({
          where: {
            id: 1,
            result: ResultStatus.Judging,
            submissionResult: {
              every: {
                NOT: {
                  result: ResultStatus.Judging
                }
              }
            }
          },
          select: {
            id: true,
            problemId: true,
            userId: true,
            contestId: true,
            updateTime: true,
            submissionResult: {
              select: {
                result: true
              }
            }
          }
        })
      ).to.be.true
      expect(
        updateSpy.calledOnceWith({
          where: {
            id: 1
          },
          data: {
            result: ResultStatus.Accepted
          }
        })
      ).to.be.true
      expect(submissionScoreSpy.notCalled).to.be.true
      expect(acceptSpy.calledOnceWith(submission.problemId, true)).to.be.true
      expect(problemScoreSpy.calledOnce).to.be.true
    })

    it('should return when judge not finished', async () => {
      sandbox.stub(db.submission, 'findUnique').resolves(undefined)
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const scoreSpy = sandbox
        .stub(service, 'calculateSubmissionScore')
        .resolves()
      const acceptSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()

      await expect(service.updateSubmissionResult(1)).not.to.be.rejected
      expect(updateSpy.notCalled).to.be.true
      expect(scoreSpy.notCalled).to.be.true
      expect(acceptSpy.notCalled).to.be.true
    })

    it('should resolve contest submission', async () => {
      sandbox.stub(db.submission, 'update').resolves()
      const acceptSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(contestSubmission)
      const submissionScoreSpy = sandbox.stub(
        service,
        'calculateSubmissionScore'
      )
      const problemScoreSpy = sandbox.stub(service, 'calculateProblemScore')

      await service.updateSubmissionResult(1)

      expect(findSpy.calledOnce).to.be.true
      expect(submissionScoreSpy.calledOnceWith(contestSubmission, true)).to.be
        .true
      expect(problemScoreSpy.calledOnce).to.be.true
      expect(acceptSpy.calledOnceWithExactly(contestSubmission.problemId, true))
        .to.be.true
    })
  })

  describe('calculateSubmissionScore', () => {
    it('should resolves', async () => {
      const findUniqueSpy = sandbox
        .stub(db.contestRecord, 'findUniqueOrThrow')
        .resolves(contestRecord)
      const findFirstSpy = sandbox
        .stub(db.contestProblem, 'findFirstOrThrow')
        .resolves({ score: 100 })
      const updateSpy = sandbox.stub(db.contestRecord, 'update').resolves()

      await service.calculateSubmissionScore(contestSubmission, true)

      expect(
        findUniqueSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contestId_userId: {
              contestId: contestSubmission.contestId,
              userId: contestSubmission.userId
            }
          },
          select: {
            id: true,
            acceptedProblemNum: true,
            score: true,
            totalPenalty: true,
            finishTime: true
          }
        })
      ).to.be.true
      expect(
        findFirstSpy.calledOnceWith({
          where: {
            contestId: contestSubmission.contestId,
            problemId: contestSubmission.problemId
          },
          select: {
            score: true
          }
        })
      ).to.be.true
      expect(updateSpy.calledOnce).to.be.true
    })

    it('should resolves', async () => {
      const findUniqueSpy = sandbox
        .stub(db.contestRecord, 'findUniqueOrThrow')
        .resolves(contestRecord)
      const findFirstSpy = sandbox
        .stub(db.contestProblem, 'findFirstOrThrow')
        .resolves({ score: 100 })
      const updateSpy = sandbox.stub(db.contestRecord, 'update').resolves()

      await service.calculateSubmissionScore(contestSubmission, false)

      expect(
        findUniqueSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contestId_userId: {
              contestId: contestSubmission.contestId,
              userId: contestSubmission.userId
            }
          },
          select: {
            id: true,
            acceptedProblemNum: true,
            score: true,
            totalPenalty: true,
            finishTime: true
          }
        })
      ).to.be.true
      expect(findFirstSpy.notCalled).to.be.true
      expect(updateSpy.calledOnce).to.be.true
    })
  })

  describe('updateTestcaseJudgeResult', () => {
    it('should resolves', async () => {
      const findSpy = sandbox
        .stub(db.submissionResult, 'findFirstOrThrow')
        .resolves(submissionResults[0])
      const updateSpy = sandbox.stub(db.submissionResult, 'update').resolves()
      const updateSubmissionResultSpy = sandbox
        .stub(service, 'updateSubmissionResult')
        .resolves()

      await service.updateTestcaseJudgeResult(submissionResults[0])

      expect(
        findSpy.calledOnceWith({
          where: {
            submissionId: submissionResults[0].submissionId,
            problemTestcaseId: submissionResults[0].problemTestcaseId
          },

          select: {
            id: true
          }
        })
      ).to.be.true
      expect(
        updateSpy.calledOnceWith({
          where: {
            id: submissionResults[0].id
          },
          data: {
            result: submissionResults[0].result,
            cpuTime: submissionResults[0].cpuTime,
            memoryUsage: submissionResults[0].memoryUsage
          }
        })
      ).to.be.true
      expect(
        updateSubmissionResultSpy.calledOnceWith(
          submissionResults[0].submissionId
        )
      ).to.be.true
    })
  })

  describe('updateProblemAccepted', () => {
    it('should update submissionCount', async () => {
      const updateSpy = sandbox.stub(db.problem, 'update').resolves()
      const id = 1
      const isAccepted = false

      await service.updateProblemAccepted(id, isAccepted)
      expect(
        updateSpy.calledOnceWith({
          where: {
            id
          },
          data: {
            submissionCount: {
              increment: 1
            }
          }
        })
      ).to.be.true
    })

    it('should update submissionCount and acceptedCount', async () => {
      const updateSpy = sandbox.stub(db.problem, 'update').resolves()
      const id = 1
      const isAccepted = true

      await service.updateProblemAccepted(id, isAccepted)
      expect(
        updateSpy.calledOnceWith({
          where: {
            id
          },
          data: {
            submissionCount: {
              increment: 1
            },
            acceptedCount: {
              increment: 1
            }
          }
        })
      ).to.be.true
    })
  })
})
