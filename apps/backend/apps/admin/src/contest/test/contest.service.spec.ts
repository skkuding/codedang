import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { ContestRole, Prisma, ResultStatus, Role } from '@prisma/client'
import { expect } from 'chai'
import { stub, type SinonStub } from 'sinon'
import { MIN_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  Contest,
  ContestProblem,
  Problem,
  UpdateHistory
} from '@admin/@generated'
import { solution } from '@admin/problem/mock/mock'
import { ContestService } from '../contest.service'
import type { ContestWithParticipants } from '../model/contest-with-participants.model'
import type {
  CreateContestInput,
  UpdateContestInput
} from '../model/contest.input'

const contestId = 1
const userId = 1
const problemId = 2
const startTime = faker.date.recent()
const endTime = faker.date.future()
const registerDueTime = faker.date.past()
const createTime = faker.date.past()
const updateTime = faker.date.past()
const invitationCode = '123456'

const contest: Contest = {
  id: contestId,
  createdById: userId,
  title: 'title',
  description: 'description',
  penalty: 20,
  lastPenalty: false,
  startTime,
  endTime,
  registerDueTime,
  unfreeze: false,
  freezeTime: null,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  evaluateWithSampleTestcase: false,
  createTime,
  updateTime,
  invitationCode,
  posterUrl: 'posterUrl',
  summary: {
    참여대상: 'participationTarget',
    진행방식: 'competitionMethod',
    순위산정: 'rankingMethod',
    문제형태: 'problemFormat',
    참여혜택: 'benefits'
  }
}

const contestWithCount = {
  ...contest,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    contestRecord: 10
  }
}

const contestWithParticipants: ContestWithParticipants = {
  id: contestId,
  createdById: userId,
  title: 'title',
  description: 'description',
  penalty: 20,
  lastPenalty: false,
  startTime,
  endTime,
  registerDueTime,
  unfreeze: false,
  freezeTime: null,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  evaluateWithSampleTestcase: false,
  createTime,
  updateTime,
  participants: 10,
  invitationCode,
  posterUrl: 'posterUrl',
  summary: {
    참여대상: 'participationTarget',
    진행방식: 'competitionMethod',
    순위산정: 'rankingMethod',
    문제형태: 'problemFormat',
    참여혜택: 'benefits'
  }
}

const problem: Problem = {
  id: problemId,
  createdById: 2,
  title: 'test problem',
  description: 'thisistestproblem',
  inputDescription: 'inputdescription',
  outputDescription: 'outputdescription',
  hint: 'hint',
  template: [],
  languages: ['C', 'Cpp'],
  solution,
  timeLimit: 10000,
  memoryLimit: 100000,
  difficulty: 'Level1',
  source: 'source',
  visibleLockTime: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  updateContentTime: faker.date.past(),
  submissionCount: 0,
  acceptedCount: 0,
  acceptedRate: 0,
  engDescription: null,
  engHint: null,
  engInputDescription: null,
  engOutputDescription: null,
  engTitle: null,
  isHiddenUploadedByZip: false,
  isSampleUploadedByZip: false
}

const contestProblem: ContestProblem = {
  id: 1,
  order: 0,
  contestId,
  problemId,
  score: 50,
  createTime,
  updateTime
}

const contestRecord = {
  id: 1,
  contestId,
  userId,
  score: 100,
  finalScore: 100,
  totalPenalty: 0,
  finalTotalPenalty: 0,
  lastAcceptedTime: new Date(),
  acceptedProblemNum: 1,
  createTime,
  updateTime,
  comment: '',
  user: {
    username: 'user01',
    studentId: '2020000000',
    userProfile: {
      realName: '홍길동'
    },
    major: 'Software'
  },
  contestProblemRecord: []
}

const userContest = {
  id: 1,
  userId,
  contestId,
  role: ContestRole.Admin
}

const submission = {
  id: 1,
  userId,
  userIp: '127.0.0.1',
  problemId,
  contestId,
  workbookId: null,
  assignmentId: null,
  code: [],
  codeSize: 1,
  language: 'C',
  result: ResultStatus.Accepted,
  createTime,
  updateTime,
  score: new Prisma.Decimal(100.0)
}

const submissionWithRelations = {
  ...submission,
  problem: {
    title: 'submission problem',
    contestProblem: [{ order: 1 }]
  },
  user: {
    username: 'user01',
    studentId: '1234567890'
  }
}

const createInput: CreateContestInput = {
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.recent(),
  endTime: faker.date.future(),
  registerDueTime: faker.date.past(),
  enableCopyPaste: true,
  isJudgeResultVisible: true
}

const updateInput: UpdateContestInput = {
  startTime: new Date('2999-01-03T12:00:00Z'),
  endTime: new Date('2999-01-03T18:00:00Z'),
  registerDueTime: new Date('2999-01-01T00:00:00Z'),
  freezeTime: new Date('2999-01-03T17:00:00Z')
}

const db = {
  user: { findUnique: stub() },
  userContest: {
    create: stub(),
    findMany: stub(),
    findUnique: stub(),
    delete: stub(),
    update: stub()
  },
  contest: {
    findFirst: stub(),
    findUniqueOrThrow: stub(),
    findUnique: stub(),
    findMany: stub(),
    create: stub(),
    update: stub(),
    delete: stub(),
    count: stub()
  },
  contestProblem: {
    create: stub(),
    findMany: stub(),
    findFirstOrThrow: stub(),
    findFirst: stub(),
    aggregate: stub(),
    delete: stub(),
    updateMany: stub(),
    count: stub()
  },
  contestRecord: {
    findMany: stub(),
    create: stub(),
    count: stub(),
    findFirst: stub(),
    findFirstOrThrow: stub(),
    delete: stub()
  },
  problem: {
    update: stub(),
    updateMany: stub(),
    findFirstOrThrow: stub(),
    findMany: stub()
  },
  submission: { findMany: stub(), groupBy: stub() },
  updateHistory: { findMany: stub() },
  $transaction: stub(),
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ContestService', () => {
  let service: ContestService
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    Object.values(db).forEach((model) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((fn) => {
          if (typeof fn === 'function' && 'resetHistory' in fn) {
            fn.resetHistory()
            fn.resetBehavior()
          }
        })
      }
    })
    db.$transaction.resetHistory()
    db.$transaction.resetBehavior()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        { provide: PrismaService, useValue: db },
        {
          provide: EventEmitter2,
          useValue: {
            emit: stub().returns(undefined)
          }
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

    service = module.get<ContestService>(ContestService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContests', () => {
    it('should return an array of contests with participants', async () => {
      db.user.findUnique.resolves({
        role: Role.Admin,
        canCreateContest: true
      })
      db.userContest.findMany.resolves([])
      db.contest.findMany.resolves([contestWithCount])

      const res = await service.getContests(userId, 5, 0)
      expect(res).to.deep.equal([contestWithParticipants])
      expect(db.user.findUnique.calledOnce).to.be.true
      expect(db.userContest.findMany.calledOnce).to.be.true
      expect(db.contest.findMany.calledOnce).to.be.true
    })
  })

  describe('getContest', () => {
    it('should return a contest with participants', async () => {
      db.contest.findUnique.resolves(contestWithCount)

      const res = await service.getContest(contestId)
      expect(res.participants).to.equal(10)
      expect(res.id).to.equal(contestId)
    })

    it('should throw error if contest not found', async () => {
      db.contest.findUnique.resolves(null)
      await expect(service.getContest(999)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('createContest', () => {
    it('should return created contest with user roles', async () => {
      db.user.findUnique.resolves({
        role: Role.Admin,
        canCreateContest: true
      })
      db.$transaction.callsFake(async (callback) => {
        const tx = {
          contest: { create: stub().resolves(contest) },
          userContest: {
            createMany: stub().resolves({ count: 0 }),
            create: stub().resolves(userContest),
            findMany: stub().resolves([userContest])
          }
        }
        return await callback(tx)
      })

      const res = await service.createContest(userId, createInput)
      expect(res).to.deep.equal({
        ...contest,
        userContest: [userContest]
      })
      expect((eventEmitter.emit as SinonStub).calledWith('contest.created')).to
        .be.true
    })
  })

  describe('updateContest', () => {
    it('should return updated contest and update problem lock time', async () => {
      const mockContest = {
        ...contest,
        contestProblem: [{ problemId }],
        userContest: []
      }
      db.contest.findUniqueOrThrow.resolves(mockContest)
      db.contestProblem.findMany.resolves([])
      db.problem.update.resolves(problem)
      db.contest.update.resolves({
        ...contest,
        ...updateInput,
        userContest: []
      })

      const res = await service.updateContest(contestId, {
        ...updateInput
      })
      expect(res.endTime).to.equal(updateInput.endTime)
      expect(db.problem.update.calledOnce).to.be.true
    })
  })

  describe('deleteContest', () => {
    it('should return deleted contest and update problem lock time', async () => {
      db.contest.findFirst.resolves({
        contestProblem: [{ problemId }]
      })
      db.contest.findMany.resolves([])
      db.problem.update.resolves(problem)
      db.contest.delete.resolves(contest)

      const res = await service.deleteContest(contestId)
      expect(res).to.deep.equal(contest)
      expect(db.problem.update.called).to.be.true
      const updateArgs = db.problem.update.getCall(0).args[0]
      expect(updateArgs.where).to.deep.equal({ id: problemId })
      expect(updateArgs.data.visibleLockTime).to.equal(MIN_DATE)
      expect(
        (eventEmitter.emit as SinonStub).calledWith(
          'contest.deleted',
          contest.id
        )
      ).to.be.true
    })
  })

  describe('getContestRoles', () => {
    it('should return an array of contest roles', async () => {
      const roles = [{ contestId: 1, role: ContestRole.Admin }]
      db.userContest.findMany.resolves(roles)

      const res = await service.getContestRoles(userId)
      expect(res).to.deep.equal(roles)
      expect(db.userContest.findMany.calledWithMatch({ where: { userId } })).to
        .be.true
    })
  })

  describe('getContestsByProblemId', () => {
    it('should return grouped contests', async () => {
      db.contestProblem.findMany.resolves([
        {
          score: 50,
          contest: {
            ...contest,
            contestProblem: [{ score: 50 }, { score: 50 }] // 총점 100점
          }
        }
      ])

      const res = await service.getContestsByProblemId(problemId)
      expect(res.ongoing).to.have.lengthOf(1)
      expect(res.upcoming).to.have.lengthOf(0)
      expect(res.finished).to.have.lengthOf(0)
      expect(res.ongoing[0].problemScore).to.equal(50)
      expect(res.ongoing[0].totalScore).to.equal(100)
    })
  })

  describe('getContestLeaderboard', () => {
    it('should return leaderboard data', async () => {
      db.contest.findUniqueOrThrow.resolves(contest)
      db.submission.groupBy
        .onFirstCall()
        .resolves([{ userId: 1 }, { userId: 2 }])
      db.contestRecord.count.resolves(3)
      // eslint-disable-next-line @typescript-eslint/naming-convention
      db.contestProblem.aggregate.resolves({ _sum: { score: 100 } })
      db.contestRecord.findMany.resolves([contestRecord])
      db.submission.groupBy
        .onSecondCall()
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .resolves([{ userId: 1, problemId: 2, _count: { id: 5 } }])
      db.contestProblem.findMany.resolves([contestProblem])

      const res = await service.getContestLeaderboard(contestId)
      expect(res.maxScore).to.equal(100)
      expect(res.participatedNum).to.equal(2)
      expect(res.registeredNum).to.equal(3)
      expect(res.isFrozen).to.be.false
      expect(res.leaderboard).to.have.lengthOf(1)
      expect(res.leaderboard[0].username).to.equal('user01')
      expect(res.leaderboard[0].problemRecords[0].submissionCount).to.equal(5)
    })
  })

  describe('getContestScoreSummaries', () => {
    it('should return score summaries for all users', async () => {
      db.contestRecord.findMany.resolves([contestRecord])
      db.contestProblem.findMany.resolves([contestProblem])
      db.submission.findMany.resolves([submission])

      const res = await service.getContestScoreSummaries({
        contestId,
        take: 10,
        cursor: null
      })
      expect(res).to.have.lengthOf(1)
      expect(res[0].username).to.equal('user01')
      expect(res[0].userContestScore).to.equal(50)
      expect(res[0].contestPerfectScore).to.equal(50)
    })
  })

  describe('getContestSubmissionSummaryByUserId', () => {
    it('should return submissions and score summary', async () => {
      db.submission.findMany.onFirstCall().resolves([submissionWithRelations])
      db.contestProblem.findMany.resolves([contestProblem])
      db.submission.findMany.onSecondCall().resolves([submission])

      const res = await service.getContestSubmissionSummaryByUserId({
        take: 10,
        contestId,
        userId,
        problemId: null,
        cursor: null
      })
      expect(res.submissions).to.have.lengthOf(1)
      expect(res.submissions[0].problemTitle).to.equal('submission problem')
      expect(res.scoreSummary.userContestScore).to.equal(50)
      expect(res.scoreSummary.contestPerfectScore).to.equal(50)
    })
  })

  describe('removeUserFromContest', () => {
    it('should remove a user from contest', async () => {
      const upcomingContest = { ...contest, startTime: faker.date.future() }
      db.contest.findUnique.resolves(upcomingContest)
      db.contestRecord.findFirst.resolves(contestRecord)
      db.userContest.findUnique.resolves(userContest)
      db.$transaction.resolves(userContest)

      const res = await service.removeUserFromContest(contestId, userId, userId)
      expect(res).to.deep.equal(userContest)
      expect(db.$transaction.calledOnce).to.be.true
    })

    it('should throw ForbiddenAccessException if contest started', async () => {
      const startedContest = { ...contest, startTime: faker.date.past() }
      db.contest.findUnique.resolves(startedContest)
      db.contestRecord.findFirst.resolves(contestRecord)
      db.userContest.findUnique.resolves(userContest)

      await expect(
        service.removeUserFromContest(contestId, userId, userId)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.$transaction.called).to.be.false
    })
  })

  describe('getContestUpdateHistories', () => {
    it('should return contest update histories with order', async () => {
      const history: UpdateHistory = {
        id: 1,
        problemId,
        updatedAt: new Date(),
        updatedByid: userId,
        updatedFields: [],
        updatedInfo: []
      }
      db.contest.findUniqueOrThrow.resolves(contest)
      db.contestProblem.findMany.resolves([contestProblem])
      db.updateHistory.findMany.resolves([history])

      const res = await service.getContestUpdateHistories(contestId)
      expect(res.updateHistories).to.have.lengthOf(1)
      expect(res.updateHistories[0].id).to.equal(history.id)
      expect(res.updateHistories[0].order).to.equal(0)
    })
  })
})
