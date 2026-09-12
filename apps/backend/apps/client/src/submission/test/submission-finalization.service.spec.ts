import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  ResultStatus,
  type Submission,
  type SubmissionResult
} from '@prisma/client'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { PrismaService } from '@libs/prisma'
import { problems } from '@admin/problem/mock/mock'
import { assignmentRecord } from '../mock/assignmentRecord.mock'
import { normalContest } from '../mock/contest.mock'
import { contestProblem } from '../mock/contestProblem.mock'
import { contestRecordsMock } from '../mock/contestRecord.mock'
import { submissions } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
import { SubmissionFinalizationService } from '../submission-finalization.service'

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

const assignmentSubmission = {
  ...submission,
  assignmentId: 1
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFunc = (...args: object[]) => []

const db = {
  submission: {
    update: mockFunc,
    count: mockFunc,
    findUniqueOrThrow: mockFunc
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
    findUnique: mockFunc
  },
  assignmentProblemRecord: {
    update: mockFunc,
    findUnique: mockFunc
  },
  problem: {
    update: mockFunc,
    findFirstOrThrow: mockFunc
  },
  contestProblemFirstSolver: {
    create: mockFunc
  },
  userContest: {
    findFirst: mockFunc
  },
  $transaction: async (fn: (prisma: typeof db) => Promise<unknown>) => {
    return fn(db)
  }
}

describe('SubmissionFinalizationService', () => {
  let service: SubmissionFinalizationService

  const sandbox = sinon.createSandbox()

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionFinalizationService,
        {
          provide: PrismaService,
          useValue: db
        }
      ]
    }).compile()

    service = module.get<SubmissionFinalizationService>(
      SubmissionFinalizationService
    )
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

  describe('finalizeSubmission', () => {
    it('should update the submission result/score and problem stats, but skip contest/assignment records for a plain submission', async () => {
      const updateSpy = sandbox.stub(db.submission, 'update').resolves()
      const problemAcceptedSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()
      const contestRecordSpy = sandbox
        .stub(service, 'updateContestRecord')
        .resolves()
      const assignmentScoreSpy = sandbox
        .stub(service, 'calculateAssignmentSubmissionScore')
        .resolves()

      await service.finalizeSubmission(submission, ResultStatus.Accepted, 100)

      expect(
        updateSpy.calledOnceWith({
          where: { id: submission.id },
          data: { result: ResultStatus.Accepted, score: 100 }
        })
      ).to.be.true
      expect(
        problemAcceptedSpy.calledOnceWithExactly(submission.problemId, true)
      ).to.be.true
      expect(contestRecordSpy.notCalled).to.be.true
      expect(assignmentScoreSpy.notCalled).to.be.true
    })

    it('should update the contest record for a contest submission', async () => {
      sandbox.stub(db.submission, 'update').resolves()
      sandbox.stub(service, 'updateProblemAccepted').resolves()
      const contestRecordSpy = sandbox
        .stub(service, 'updateContestRecord')
        .resolves()
      const assignmentScoreSpy = sandbox
        .stub(service, 'calculateAssignmentSubmissionScore')
        .resolves()

      await service.finalizeSubmission(
        contestSubmission,
        ResultStatus.Accepted,
        100
      )

      expect(contestRecordSpy.calledOnceWithExactly(contestSubmission, true)).to
        .be.true
      expect(assignmentScoreSpy.notCalled).to.be.true
    })

    it('should update the assignment record for an assignment submission', async () => {
      sandbox.stub(db.submission, 'update').resolves()
      sandbox.stub(service, 'updateProblemAccepted').resolves()
      const contestRecordSpy = sandbox
        .stub(service, 'updateContestRecord')
        .resolves()
      const assignmentScoreSpy = sandbox
        .stub(service, 'calculateAssignmentSubmissionScore')
        .resolves()

      await service.finalizeSubmission(
        assignmentSubmission,
        ResultStatus.Accepted,
        100
      )

      expect(
        assignmentScoreSpy.calledOnceWithExactly(assignmentSubmission, true)
      ).to.be.true
      expect(contestRecordSpy.notCalled).to.be.true
    })

    it('should derive isAccepted as false for a non-accepted result and skip records without a userId', async () => {
      sandbox.stub(db.submission, 'update').resolves()
      const problemAcceptedSpy = sandbox
        .stub(service, 'updateProblemAccepted')
        .resolves()
      const contestRecordSpy = sandbox
        .stub(service, 'updateContestRecord')
        .resolves()
      const assignmentScoreSpy = sandbox
        .stub(service, 'calculateAssignmentSubmissionScore')
        .resolves()

      await service.finalizeSubmission(
        { ...contestSubmission, userId: null },
        ResultStatus.WrongAnswer,
        0
      )

      expect(
        problemAcceptedSpy.calledOnceWithExactly(submission.problemId, false)
      ).to.be.true
      expect(contestRecordSpy.notCalled).to.be.true
      expect(assignmentScoreSpy.notCalled).to.be.true
    })
  })

  describe('updateContestRecord', () => {
    it('should update records when new accepted submission', async () => {
      // 일반 참가자 제출 → staff가 아님
      sandbox.stub(db.userContest, 'findFirst').resolves(null)

      const submissionCountSpy = sandbox
        .stub(db.submission, 'count')
        .resolves(0)
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
      const aggregateSpy = sandbox
        .stub(db.contestProblemRecord, 'aggregate')
        .resolves({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _sum: {
            score: 100,
            submitCountPenalty: 10,
            timePenalty: 100,
            finalScore: 100,
            finalTimePenalty: 100,
            finalSubmitCountPenalty: 10
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _max: {
            timePenalty: 100,
            finalTimePenalty: 100
          }
        })
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
        submissionCountSpy.calledOnceWith({
          where: {
            contestId: contestSubmission.contestId,
            problemId: contestSubmission.problemId,
            userId: contestSubmission.userId,
            result: ResultStatus.Accepted,
            id: { not: contestSubmission.id }
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
        aggregateSpy.calledOnceWith({
          where: { contestRecordId: contestRecordsMock[0].id },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _sum: {
            score: true,
            submitCountPenalty: true,
            timePenalty: true,
            finalScore: true,
            finalTimePenalty: true,
            finalSubmitCountPenalty: true
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _max: {
            timePenalty: true,
            finalTimePenalty: true
          }
        })
      ).to.be.true
      expect(updateRecordSpy.calledOnce).to.be.true
    })

    it('should reject when submission is not accepted', async () => {
      const submissionCountSpy = sandbox
        .stub(db.submission, 'count')
        .resolves(0)
      const upsertProblemRecordSpy = sandbox
        .stub(db.contestProblemRecord, 'upsert')
        .resolves()
      const updateRecordSpy = sandbox
        .stub(db.contestRecord, 'update')
        .resolves()

      // when
      await service.updateContestRecord(contestSubmission, false)

      expect(submissionCountSpy.notCalled).to.be.true
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

    it('should resolves when not accepted', async () => {
      const findUniqueSpy = sandbox
        .stub(db.assignmentRecord, 'findUniqueOrThrow')
        .resolves(assignmentRecord)
      const getScoreSpy = sandbox
        .stub(db.assignmentProblem, 'findUnique')
        .resolves({ score: 100 })
      const updateSpy = sandbox.stub(db.assignmentRecord, 'update').resolves()

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
