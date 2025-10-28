import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
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
import { problems } from '@admin/problem/mock/mock'
import { assignmentRecord } from '../mock/assignmentRecord.mock'
import { normalContest } from '../mock/contest.mock'
import { contestProblem } from '../mock/contestProblem.mock'
import { contestRecordsMock } from '../mock/contestRecord.mock'
import { submissions } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
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

const submission: Submission & { submissionResult: SubmissionResult[] } = {
  ...submissions[0],
  codeSize: 1000,
  submissionResult: [submissionResults[0], submissionResults[1]],
  score: 100
}

const contestSubmission = {
  ...submission,
  contestId: 1,
  contest: {
    evaluateWithSampleTestcase: true
  }
}

const assignmentSubmission = {
  ...submission,
  assignmentId: 1
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFunc = (...args: object[]) => []

const db = {
  submission: {
    findUnique: mockFunc,
    findUniqueOrThrow: mockFunc,
    update: mockFunc,
    findFirst: mockFunc,
    findMany: mockFunc
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
    findMany: mockFunc
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
  testSubmission: {
    findUnique: mockFunc,
    update: mockFunc
  },
  $transaction: async (fn: (prisma: typeof db) => Promise<unknown>) => {
    return fn(db)
  }
}

describe('SubmissionSubscriptionService', () => {
  let service: SubmissionSubscriptionService
  let amqpService: JudgeAMQPService
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
    cache = module.get<Cache>(CACHE_MANAGER)
    sandbox.stub(cache, 'get').resolves([])
    sandbox
      .stub(db, '$transaction')
      .callsFake(
        async <T>(fn: (prisma: typeof db) => Promise<T>): Promise<T> => {
          return fn(db)
        }
      )
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
      expect(typeof handlers.onRunMessage).to.equal('function')
      expect(typeof handlers.onJudgeMessage).to.equal('function')
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

  describe('handleRunMessage', () => {
    it('should handle run message with testcaseId', async () => {
      const testSubmission = {
        id: 1,
        maxCpuTime: BigInt(50000),
        maxMemoryUsage: 5000000
      }
      const testcase = {
        id: 1,
        result: ResultStatus.Accepted,
        output: 'test output'
      }

      sandbox.stub(db.testSubmission, 'findUnique').resolves(testSubmission)
      sandbox.stub(db.testSubmission, 'update').resolves()
      sandbox.stub(cache, 'get').resolves(testcase)
      sandbox.stub(cache, 'set').resolves()

      await expect(service.handleRunMessage(msg, 1, false)).not.to.be.rejected
    })

    it('should handle run message without testcaseId (compile error)', async () => {
      const msgWithoutTestcase = {
        ...msg,
        judgeResult: {
          ...judgeResult,
          testcaseId: null
        }
      }
      const testcaseIds = [1, 2, 3]

      sandbox.stub(cache, 'get').resolves(testcaseIds)
      sandbox.stub(cache, 'set').resolves()

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.handleRunMessage(msgWithoutTestcase as any, 1, false)
      ).not.to.be.rejected
    })

    it('should handle user test run message', async () => {
      const testSubmission = {
        id: 1,
        maxCpuTime: BigInt(50000),
        maxMemoryUsage: 5000000
      }
      const testcase = {
        id: 1,
        result: ResultStatus.Accepted,
        output: 'test output'
      }

      sandbox.stub(db.testSubmission, 'findUnique').resolves(testSubmission)
      sandbox.stub(db.testSubmission, 'update').resolves()
      sandbox.stub(cache, 'get').resolves(testcase)
      sandbox.stub(cache, 'set').resolves()

      await expect(service.handleRunMessage(msg, 1, true)).not.to.be.rejected
    })
  })

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

      await expect(service.handleJudgerMessage(msg)).not.to.be.rejected
      expect(
        spy.calledOnceWithExactly({
          submissionId: msg.submissionId,
          problemTestcaseId: msg.judgeResult.testcaseId,
          result: Status(msg.resultCode),
          cpuTime: BigInt(msg.judgeResult.cpuTime),
          memoryUsage: msg.judgeResult.memory,
          output: undefined
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

  describe('updateContestSubmissionResult', () => {
    it('should resolve', async () => {
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(submission)
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const submissionScoreSpy = sandbox
        .stub(service, 'updateContestRecord')
        .resolves()
      const problemScoreSpy = sandbox
        .stub(service, 'updateSubmissionScore')
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
            assignmentId: true,
            updateTime: true,
            createTime: true,
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
      const scoreSpy = sandbox.stub(service, 'updateContestRecord').resolves()
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
      const submissionScoreSpy = sandbox.stub(service, 'updateContestRecord')
      const problemScoreSpy = sandbox.stub(service, 'updateSubmissionScore')

      await service.updateSubmissionResult(1)

      expect(findSpy.calledOnce).to.be.true
      expect(submissionScoreSpy.calledOnceWith(contestSubmission, true)).to.be
        .true
      expect(problemScoreSpy.calledOnce).to.be.true
      expect(acceptSpy.calledOnceWithExactly(contestSubmission.problemId, true))
        .to.be.true
    })
  })

  describe('updateAssignmentSubmissionResult', () => {
    it('should resolve', async () => {
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(submission)
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const submissionScoreSpy = sandbox
        .stub(service, 'calculateAssignmentSubmissionScore')
        .resolves()
      const problemScoreSpy = sandbox
        .stub(service, 'updateSubmissionScore')
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
        .stub(service, 'calculateAssignmentSubmissionScore')
        .resolves()
      const acceptSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()

      await expect(service.updateSubmissionResult(1)).not.to.be.rejected
      expect(updateSpy.notCalled).to.be.true
      expect(scoreSpy.notCalled).to.be.true
      expect(acceptSpy.notCalled).to.be.true
    })

    it('should resolve assignment submission', async () => {
      sandbox.stub(db.submission, 'update').resolves()
      const acceptSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()
      const findSpy = sandbox
        .stub(db.submission, 'findUnique')
        .resolves(assignmentSubmission)
      const submissionScoreSpy = sandbox.stub(
        service,
        'calculateAssignmentSubmissionScore'
      )
      const problemScoreSpy = sandbox.stub(service, 'updateSubmissionScore')

      await service.updateSubmissionResult(1)

      expect(findSpy.calledOnce).to.be.true
      expect(submissionScoreSpy.calledOnceWith(assignmentSubmission, true)).to
        .be.true
      expect(problemScoreSpy.calledOnce).to.be.true
      expect(
        acceptSpy.calledOnceWithExactly(assignmentSubmission.problemId, true)
      ).to.be.true
    })
  })

  describe('updateContestRecord', () => {
    it('should update records when new accepted submission', async () => {
      const submissionFindManySpy = sandbox
        .stub(db.submission, 'findMany')
        .resolves([contestSubmission])
      const contestFindUniqueSpy = sandbox
        .stub(db.contest, 'findUniqueOrThrow')
        .resolves({
          normalContest,
          submission: submissions
        })
      const contestProblemFindUniqueSpy = sandbox
        .stub(db.contestProblem, 'findUniqueOrThrow')
        .resolves(contestProblem)
      const contestRecordFindUniqueSpy = sandbox
        .stub(db.contestRecord, 'findUniqueOrThrow')
        .resolves(contestRecordsMock[0])
      const problemRecordFindManySpy = sandbox
        .stub(db.contestProblemRecord, 'findMany')
        .resolves([])
      const upsertProblemRecordSpy = sandbox
        .stub(db.contestProblemRecord, 'upsert')
        .resolves()
      const updateRecordSpy = sandbox
        .stub(db.contestRecord, 'update')
        .resolves()

      // when
      await service.updateContestRecord(contestSubmission, true)

      // then
      expect(
        submissionFindManySpy.calledOnceWith({
          where: {
            contestId: contestSubmission.contestId,
            problemId: contestSubmission.problemId,
            result: ResultStatus.Accepted
          },
          select: {
            id: true,
            userId: true,
            createTime: true
          }
        })
      ).to.be.true
      expect(
        contestFindUniqueSpy.calledOnceWith({
          where: {
            id: contestSubmission.contestId
          },
          select: {
            startTime: true,
            penalty: true,
            lastPenalty: true,
            freezeTime: true,
            submission: {
              where: {
                userId: contestSubmission.userId,
                problemId: contestSubmission.problemId
              },
              select: {
                id: true
              }
            }
          }
        })
      ).to.be.true
      expect(
        contestProblemFindUniqueSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contestId_problemId: {
              contestId: contestSubmission.contestId,
              problemId: contestSubmission.problemId
            }
          },
          select: {
            id: true,
            score: true
          }
        })
      ).to.be.true
      expect(
        contestRecordFindUniqueSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contestId_userId: {
              contestId: contestSubmission.contestId,
              userId: contestSubmission.userId
            }
          },
          select: {
            id: true
          }
        })
      ).to.be.true
      expect(upsertProblemRecordSpy.calledOnce).to.be.true

      expect(
        problemRecordFindManySpy.calledOnceWith({
          where: {
            contestRecordId: contestRecordsMock[0].id
          },
          select: {
            score: true,
            timePenalty: true,
            submitCountPenalty: true,
            finalScore: true,
            finalTimePenalty: true,
            finalSubmitCountPenalty: true
          }
        })
      ).to.be.true
      expect(updateRecordSpy.calledOnce).to.be.true
    })

    it('should reject when submission is not accepted', async () => {
      const submissionFindManySpy = sandbox
        .stub(db.submission, 'findMany')
        .resolves([])
      const upsertProblemRecordSpy = sandbox
        .stub(db.contestProblemRecord, 'upsert')
        .resolves()
      const updateRecordSpy = sandbox
        .stub(db.contestRecord, 'update')
        .resolves()

      // when
      await service.updateContestRecord(contestSubmission, false)

      expect(
        submissionFindManySpy.calledOnceWith({
          where: {
            contestId: contestSubmission.contestId,
            problemId: contestSubmission.problemId,
            result: ResultStatus.Accepted
          },
          select: {
            id: true,
            userId: true,
            createTime: true
          }
        })
      ).to.be.true
      expect(upsertProblemRecordSpy.notCalled).to.be.true
      expect(updateRecordSpy.notCalled).to.be.true
    })
  })

  describe('calculateAssignmentSubmissionScore', () => {
    it('should resolves', async () => {
      const findUniqueSpy = sandbox
        .stub(db.assignmentRecord, 'findUniqueOrThrow')
        .resolves(assignmentRecord)
      const updateSpy = sandbox.stub(db.assignmentRecord, 'update').resolves()
      const getScoreSpy = sandbox
        .stub(db.assignmentProblem, 'findUnique')
        .resolves({ score: 100 })
      // eslint-disable-next-line @typescript-eslint/naming-convention
      sandbox.stub(db.problemTestcase, 'aggregate').resolves({ _sum: 3 })

      await service.calculateAssignmentSubmissionScore(
        assignmentSubmission,
        true
      )

      expect(
        findUniqueSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_userId: {
              assignmentId: assignmentSubmission.assignmentId,
              userId: assignmentSubmission.userId
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
        getScoreSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_problemId: {
              assignmentId: assignmentSubmission.assignmentId,
              problemId: assignmentSubmission.problemId
            }
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
        .stub(db.assignmentRecord, 'findUniqueOrThrow')
        .resolves(assignmentRecord)
      const getScoreSpy = sandbox
        .stub(db.assignmentProblem, 'findUnique')
        .resolves({ score: 100 })
      const updateSpy = sandbox.stub(db.assignmentRecord, 'update').resolves()
      // eslint-disable-next-line @typescript-eslint/naming-convention
      sandbox.stub(db.problemTestcase, 'aggregate').resolves({ _sum: 3 })

      await service.calculateAssignmentSubmissionScore(
        assignmentSubmission,
        false
      )

      expect(
        findUniqueSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_userId: {
              assignmentId: assignmentSubmission.assignmentId,
              userId: assignmentSubmission.userId
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
        getScoreSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_problemId: {
              assignmentId: assignmentSubmission.assignmentId,
              problemId: assignmentSubmission.problemId
            }
          },
          select: {
            score: true
          }
        })
      ).to.be.true
      expect(updateSpy.calledOnce).to.be.true
    })
  })

  describe('updateTestcaseJudgeResult', () => {
    it('should resolves', async () => {
      const updateSpy = sandbox.stub(db.submissionResult, 'update').resolves()
      const updateSubmissionResultSpy = sandbox
        .stub(service, 'updateSubmissionResult')
        .resolves()

      await service.updateTestcaseJudgeResult(submissionResults[0])

      expect(
        updateSpy.calledOnceWith({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            submissionId_problemTestcaseId: {
              submissionId: submissionResults[0].submissionId,
              problemTestcaseId: submissionResults[0].problemTestcaseId
            }
          },
          data: {
            result: submissionResults[0].result,
            cpuTime: submissionResults[0].cpuTime,
            memoryUsage: submissionResults[0].memoryUsage,
            output: null
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
      sandbox.stub(db.problem, 'findFirstOrThrow').resolves(problems[0])
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
            },
            acceptedRate:
              problems[0].acceptedCount / (problems[0].submissionCount + 1)
          }
        })
      ).to.be.true
    })

    it('should update submissionCount and acceptedCount', async () => {
      const updateSpy = sandbox.stub(db.problem, 'update').resolves()
      sandbox.stub(db.problem, 'findFirstOrThrow').resolves(problems[0])
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
            },
            acceptedRate:
              (problems[0].acceptedCount + 1) /
              (problems[0].submissionCount + 1)
          }
        })
      ).to.be.true
    })
  })
})
