import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { JudgeAMQPService } from '@libs/amqp'
import { Status } from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { submissions } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
import { SubmissionFinalizationService } from '../submission-finalization.service'
import { SubmissionSubscriptionService } from '../submission-sub.service'

const judgeResult = {
  testcaseId: 1,
  resultCode: 1,
  cpuTime: 100000,
  realTime: 120000,
  memory: 10000000,
  signal: 0,
  exitCode: 0,
  errorCode: 0,
  output: undefined
}

const msg = {
  resultCode: 1,
  submissionId: 1,
  error: '',
  judgeResult
}

const submissionResponseMsg = {
  submissionId: 1,
  judgeResults: [msg]
}

const submission: Submission & { submissionResult: SubmissionResult[] } = {
  ...submissions[0],
  codeSize: 1000,
  submissionResult: [submissionResults[0], submissionResults[1]],
  score: new Prisma.Decimal(100)
}

const contestSubmission = {
  ...submission,
  contestId: 1,
  contest: {
    evaluateWithSampleTestcase: true
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFunc = (...args: object[]) => []

const db = {
  submission: {
    findUnique: mockFunc,
    findUniqueOrThrow: mockFunc,
    update: mockFunc,
    updateMany: mockFunc,
    findFirst: mockFunc,
    count: mockFunc
  },
  submissionResult: {
    findFirstOrThrow: mockFunc,
    updateMany: mockFunc,
    update: mockFunc
  },
  contest: {
    findUniqueOrThrow: mockFunc
  },
  contestRecord: {
    findUniqueOrThrow: mockFunc,
    update: mockFunc
  },
  contestProblem: {
    findUniqueOrThrow: mockFunc
  },
  contestProblemRecord: {
    upsert: mockFunc,
    aggregate: mockFunc
  },
  assignmentRecord: {
    findUniqueOrThrow: mockFunc,
    update: mockFunc
  },
  assignmentProblem: {
    findFirstOrThrow: mockFunc,
    findUnique: mockFunc
  },
  assignmentProblemRecord: {
    update: mockFunc,
    findUnique: mockFunc,
    findFirst: mockFunc,
    upsert: mockFunc
  },
  problem: {
    update: mockFunc,
    findFirstOrThrow: mockFunc
  },
  problemTestcase: {
    findMany: mockFunc,
    aggregate: mockFunc,
    update: mockFunc
  },
  contestProblemFirstSolver: {
    create: mockFunc
  },
  userContest: {
    findFirst: mockFunc
  },
  testSubmission: {
    findUnique: mockFunc,
    update: mockFunc
  },
  $executeRaw: mockFunc,
  $transaction: async (arg: unknown) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg)
    }
    return (arg as (prisma: typeof db) => Promise<unknown>)(db)
  }
}

describe('SubmissionSubscriptionService', () => {
  let service: SubmissionSubscriptionService
  let amqpService: JudgeAMQPService
  let finalization: SubmissionFinalizationService
  let cache: Cache

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
          provide: JudgeAMQPService,
          useFactory: () => ({
            setMessageHandlers: () => [],
            startSubscription: () => []
          })
        },
        {
          provide: SubmissionFinalizationService,
          useFactory: () => ({
            finalizeSubmission: () => []
          })
        },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => [],
            del: () => [],
            store: {
              keys: () => []
            }
          })
        }
      ]
    }).compile()

    service = module.get<SubmissionSubscriptionService>(
      SubmissionSubscriptionService
    )
    amqpService = module.get<JudgeAMQPService>(JudgeAMQPService)
    finalization = module.get<SubmissionFinalizationService>(
      SubmissionFinalizationService
    )
    cache = module.get<Cache>(CACHE_MANAGER)
    sandbox.stub(cache, 'get').resolves([])
    sandbox.stub(db, '$transaction').callsFake(async (arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg)
      }
      return (arg as (prisma: typeof db) => Promise<unknown>)(db)
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('onModuleInit', () => {
    it('should set message handlers', () => {
      const mqttSpy = sandbox.stub(amqpService, 'setMessageHandlers')

      service.onModuleInit()

      expect(mqttSpy.calledOnce).to.be.true
      const handlers = mqttSpy.getCall(0).args[0]
      expect(handlers).to.have.property('onRunMessage')
      expect(handlers).to.have.property('onJudgeMessage')
      expect(handlers).to.have.property('onRunSubmissionMessage')
      expect(handlers).to.have.property('onSubmissionMessage')
      expect(typeof handlers.onRunMessage).to.equal('function')
      expect(typeof handlers.onJudgeMessage).to.equal('function')
      expect(typeof handlers.onRunSubmissionMessage).to.equal('function')
      expect(typeof handlers.onSubmissionMessage).to.equal('function')
    })
  })

  describe('parseJudgerResponse', () => {
    it('should return JudgerResponse', async () => {
      const result = await service.parseJudgerResponse(msg)

      expect(result).to.be.deep.equal(msg)
    })

    it('should throw ValidationError', async () => {
      const invalidMsg = {
        resultCode: 'a',
        submissionId: 1,
        error: '',
        judgeResult
      }

      await expect(service.parseJudgerResponse(invalidMsg)).to.be.rejected
    })
  })

  // TODO: Change to handleRunSubmissionMessage
  // describe('handleRunMessage', () => {
  //   it('should handle run message with testcaseId', async () => {
  //     const testSubmission = {
  //       id: 1,
  //       maxCpuTime: BigInt(50000),
  //       maxMemoryUsage: 5000000
  //     }
  //     const testcase = {
  //       id: 1,
  //       result: ResultStatus.Accepted,
  //       output: 'test output'
  //     }

  //     sandbox.stub(db.testSubmission, 'findUnique').resolves(testSubmission)
  //     sandbox.stub(db.testSubmission, 'update').resolves()
  //     sandbox.stub(cache, 'get').resolves(testcase)
  //     sandbox.stub(cache, 'set').resolves()

  //     await expect(service.handleRunMessage(msg, 1, false)).not.to.be.rejected
  //   })

  //   it('should handle run message without testcaseId (compile error)', async () => {
  //     const msgWithoutTestcase = {
  //       ...msg,
  //       judgeResult: {
  //         ...judgeResult,
  //         testcaseId: null
  //       }
  //     }
  //     const testcaseIds = [1, 2, 3]

  //     sandbox.stub(cache, 'get').resolves(testcaseIds)
  //     sandbox.stub(cache, 'set').resolves()

  //     await expect(
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       service.handleRunMessage(msgWithoutTestcase as any, 1, false)
  //     ).not.to.be.rejected
  //   })

  //   it('should handle user test run message', async () => {
  //     const testSubmission = {
  //       id: 1,
  //       maxCpuTime: BigInt(50000),
  //       maxMemoryUsage: 5000000
  //     }
  //     const testcase = {
  //       id: 1,
  //       result: ResultStatus.Accepted,
  //       output: 'test output'
  //     }

  //     sandbox.stub(db.testSubmission, 'findUnique').resolves(testSubmission)
  //     sandbox.stub(db.testSubmission, 'update').resolves()
  //     sandbox.stub(cache, 'get').resolves(testcase)
  //     sandbox.stub(cache, 'set').resolves()

  //     await expect(service.handleRunMessage(msg, 1, true)).not.to.be.rejected
  //   })
  // })

  describe('parseError', () => {
    it('should return output when judgeResult has output', () => {
      const msgWithOutput = {
        ...msg,
        judgeResult: {
          ...judgeResult,
          output: 'test output'
        }
      }

      const result = service.parseError(msgWithOutput, ResultStatus.Accepted)
      expect(result).to.equal('test output')
    })

    it('should return error message for CompileError', () => {
      const msgWithError = {
        ...msg,
        error: 'compilation failed'
      }

      const result = service.parseError(msgWithError, ResultStatus.CompileError)
      expect(result).to.equal('compilation failed')
    })

    it('should return Segmentation Fault for SegmentationFaultError', () => {
      const result = service.parseError(
        msg,
        ResultStatus.SegmentationFaultError
      )
      expect(result).to.equal('Segmentation Fault')
    })

    it('should return Value Error for RuntimeError', () => {
      const result = service.parseError(msg, ResultStatus.RuntimeError)
      expect(result).to.equal('Value Error')
    })

    it('should return empty string for other statuses', () => {
      const result = service.parseError(msg, ResultStatus.Accepted)
      expect(result).to.equal('')
    })
  })

  describe('handleJudgerMessage', () => {
    it('should resolve', async () => {
      const spy = sandbox.stub(service, 'updateTestcaseJudgeResult').resolves()

      await expect(service.handleJudgerMessage(submissionResponseMsg)).not.to.be
        .rejected
      expect(
        spy.calledOnceWithExactly([
          {
            submissionId: submissionResponseMsg.submissionId,
            problemTestcaseId:
              submissionResponseMsg.judgeResults[0].judgeResult.testcaseId,
            result: Status(submissionResponseMsg.judgeResults[0].resultCode),
            cpuTime: BigInt(
              submissionResponseMsg.judgeResults[0].judgeResult.cpuTime
            ),
            memoryUsage:
              submissionResponseMsg.judgeResults[0].judgeResult.memory,
            output: submissionResponseMsg.judgeResults[0].judgeResult.output
          }
        ])
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
      const multiMsg = {
        submissionId: 1,
        judgeResults: [serverErrMsg, msg]
      }
      await service.handleJudgerMessage(multiMsg)
      expect(handlerSpy.calledOnceWith(ResultStatus.ServerError, serverErrMsg))
        .to.be.true
      expect(updateSpy.notCalled).to.be.true
    })

    it('should call handleJudgeError when CompileError detected', async () => {
      const handlerSpy = sandbox.stub(service, 'handleJudgeError').resolves()
      const updateSpy = sandbox
        .stub(service, 'updateTestcaseJudgeResult')
        .resolves()
      const compileErrMsg = {
        resultCode: 6,
        submissionId: 1,
        error: '',
        judgeResult
      }
      const multiMsg = {
        submissionId: 1,
        judgeResults: [compileErrMsg, msg]
      }

      await service.handleJudgerMessage(multiMsg)
      expect(
        handlerSpy.calledOnceWith(ResultStatus.CompileError, compileErrMsg)
      ).to.be.true
      expect(updateSpy.notCalled).to.be.true
    })

    it('should throw when judgeResult is missing', async () => {
      const missingResultJudgeResponse = {
        resultCode: 1,
        submissionId: 1,
        error: ''
      }

      const missingResultMsg = {
        submissionId: 1,
        judgeResults: [missingResultJudgeResponse]
      }

      await expect(
        service.handleJudgerMessage(missingResultMsg)
      ).to.be.rejectedWith(UnprocessableDataException)
    })
  })

  describe('handleJudgeError', () => {
    it('should handle ServerError', async () => {
      const updateManySubmissionSpy = sandbox
        .stub(db.submission, 'updateMany')
        .resolves({ count: 1 })
      const updateManyResultSpy = sandbox
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
        updateManySubmissionSpy.calledOnceWith({
          where: {
            id: serverErrMsg.submissionId,
            result: ResultStatus.Judging
          },
          data: {
            result: ResultStatus.ServerError
          }
        })
      ).to.be.true
      expect(
        updateManyResultSpy.calledOnceWith({
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
      const updateManySubmissionSpy = sandbox
        .stub(db.submission, 'updateMany')
        .resolves({ count: 1 })
      const updateManyResultSpy = sandbox
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
        updateManySubmissionSpy.calledOnceWith({
          where: {
            id: serverErrMsg.submissionId,
            result: ResultStatus.Judging
          },
          data: {
            result: ResultStatus.CompileError
          }
        })
      ).to.be.true
      expect(
        updateManyResultSpy.calledOnceWith({
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
    it('should calculate score and delegate finalization for an accepted submission', async () => {
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(submission)
      const scoreSpy = sandbox
        .stub(service, 'calculateSubmissionScore')
        .resolves(100)
      const finalizeSpy = sandbox.stub(finalization, 'finalizeSubmission')

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
            assignmentId: true,
            createTime: true,
            updateTime: true,
            submissionResult: {
              select: {
                result: true,
                problemTestcaseId: true
              }
            },
            contest: {
              select: {
                evaluateWithSampleTestcase: true
              }
            }
          }
        })
      ).to.be.true
      expect(scoreSpy.calledOnceWith(submission.id)).to.be.true
      expect(finalizeSpy.calledOnceWith(submission, ResultStatus.Accepted, 100))
        .to.be.true
    })

    it('should return without calculating score when judge not finished', async () => {
      sandbox.stub(db.submission, 'findUnique').resolves(undefined)
      const scoreSpy = sandbox.stub(service, 'calculateSubmissionScore')
      const finalizeSpy = sandbox.stub(finalization, 'finalizeSubmission')

      await expect(service.updateSubmissionResult(1)).not.to.be.rejected
      expect(scoreSpy.notCalled).to.be.true
      expect(finalizeSpy.notCalled).to.be.true
    })

    it('should pass the fetched submission through for a contest submission', async () => {
      sandbox.stub(db.submission, 'findUnique').resolves(contestSubmission)
      const scoreSpy = sandbox
        .stub(service, 'calculateSubmissionScore')
        .resolves(100)
      const finalizeSpy = sandbox.stub(finalization, 'finalizeSubmission')

      await service.updateSubmissionResult(1)

      expect(scoreSpy.calledOnceWith(contestSubmission.id)).to.be.true
      expect(
        finalizeSpy.calledOnceWith(
          contestSubmission,
          ResultStatus.Accepted,
          100
        )
      ).to.be.true
    })
  })

  describe('updateTestcaseJudgeResult', () => {
    it('should return early when submissionResults is empty', async () => {
      const transactionSpy = sandbox.stub(db, '$transaction').resolves([])
      const updateSubmissionResultSpy = sandbox
        .stub(service, 'updateSubmissionResult')
        .resolves()

      await service.updateTestcaseJudgeResult([])

      expect(transactionSpy.notCalled).to.be.true
      expect(updateSubmissionResultSpy.notCalled).to.be.true
    })

    it('should run both submission_result and problem_testcase batch updates when there are valid stats targets', async () => {
      const executeRawSpy = sandbox.stub(db, '$executeRaw').resolves(1)
      const transactionSpy = sandbox.stub(db, '$transaction').resolves([1, 1])
      const updateSubmissionResultSpy = sandbox
        .stub(service, 'updateSubmissionResult')
        .resolves()

      await service.updateTestcaseJudgeResult(submissionResults)

      expect(transactionSpy.calledOnce).to.be.true
      const passedQueries = transactionSpy.firstCall.args[0]
      expect(passedQueries).to.have.lengthOf(2)
      expect(executeRawSpy.calledTwice).to.be.true

      expect(
        updateSubmissionResultSpy.calledOnceWith(
          submissionResults[0].submissionId
        )
      ).to.be.true
    })

    it('should skip the problem_testcase batch when all results are Judging/ServerError/Blind/Canceled', async () => {
      const executeRawSpy = sandbox.stub(db, '$executeRaw').resolves(1)
      const transactionSpy = sandbox.stub(db, '$transaction').resolves([1])
      sandbox.stub(service, 'updateSubmissionResult').resolves()

      const canceledOnly = [
        { ...submissionResults[0], result: ResultStatus.Canceled }
      ]

      await service.updateTestcaseJudgeResult(canceledOnly)

      const passedQueries = transactionSpy.firstCall.args[0]
      expect(passedQueries).to.have.lengthOf(1)
      expect(executeRawSpy.calledOnce).to.be.true
    })
  })
})
