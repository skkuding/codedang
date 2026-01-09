import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'
import { Contest, ContestProblem, ContestRecord, Problem } from '@generated'
import { faker } from '@faker-js/faker'
import { ContestRole, ResultStatus, Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { solution } from '@admin/problem/mock/mock'
import { ContestService } from './contest.service'
import type { ContestWithParticipants } from './model/contest-with-participants.model'
import type {
  CreateContestInput,
  UpdateContestInput
} from './model/contest.input'

const contestId = 1
const userId = 1
const problemId = 2
const startTime = faker.date.recent()
const endTime = faker.date.future()
const registerDueTime = faker.date.past()
const createTime = faker.date.past()
const updateTime = faker.date.past()
const invitationCode = '123456'
const problemIdsWithScore = {
  problemId,
  score: 10
}
// const duplicatedContestId = 2

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
  contestProblem: [],
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    contestRecord: 10
  },
  posterUrl: 'posterUrl',
  summary: {
    참여대상: 'participationTarget',
    진행방식: 'competitionMethod',
    순위산정: 'rankingMethod',
    문제형태: 'problemFormat',
    참여혜택: 'benefits'
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
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const submissionsWithProblemTitleAndUsername = {
  id: 1,
  userId: 1,
  userIp: '127.0.0.1',
  problemId: 1,
  contestId: 1,
  workbookId: 1,
  code: [],
  codeSize: 1,
  language: 'C',
  result: ResultStatus.Accepted,
  createTime: '2000-01-01',
  updateTime: '2000-01-02',
  problem: {
    title: 'submission'
  },
  user: {
    username: 'user01',
    studentId: '1234567890'
  }
}

// const submissionResults = [
//   {
//     id: 1,
//     submissionId: 1,
//     problemTestcaseId: 1,
//     result: ResultStatus.Accepted,
//     cpuTime: BigInt(1),
//     memory: 1,
//     createTime: '2000-01-01',
//     updateTime: '2000-01-02'
//   }
// ]

const input = {
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.recent(),
  endTime: faker.date.future(),
  registerDueTime: faker.date.past(),
  enableCopyPaste: true,
  isJudgeResultVisible: true
} satisfies CreateContestInput

const updateInput = {
  startTime,
  endTime,
  registerDueTime: faker.date.past(),
  freezeTime: faker.date.between({
    from: startTime,
    to: endTime
  })
} satisfies UpdateContestInput

const db = {
  user: {
    findUnique: stub().resolves({ role: Role.Admin, canCreateContest: true })
  },
  userContest: {
    create: stub().resolves(),
    findMany: stub().resolves([
      {
        role: ContestRole.Admin
      }
    ])
  },
  contest: {
    findFirst: stub().resolves(Contest),
    findUniqueOrThrow: stub().resolves(Contest),
    findUnique: stub().resolves(Contest),
    findMany: stub().resolves([Contest]),
    create: stub().resolves(Contest),
    update: stub().resolves(Contest),
    delete: stub().resolves(Contest)
  },
  contestProblem: {
    create: stub().resolves(ContestProblem),
    findMany: stub().resolves([ContestProblem]),
    findFirstOrThrow: stub().resolves(ContestProblem),
    findFirst: stub().resolves(ContestProblem),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    aggregate: stub().resolves({ _max: { order: 5 } })
  },
  contestRecord: {
    findMany: stub().resolves([ContestRecord]),
    create: stub().resolves(ContestRecord)
  },
  problem: {
    update: stub().resolves(Problem),
    updateMany: stub().resolves([Problem]),
    findFirstOrThrow: stub().resolves(Problem)
  },
  submission: {
    findMany: stub().resolves([submissionsWithProblemTitleAndUsername])
  },
  $transaction: stub().callsFake(async (arg) => {
    if (typeof arg === 'function') {
      // 콜백 기반 트랜잭션 (e.g. createContest)
      const tx = {
        contest: {
          create: stub().resolves(contest)
        },
        userContest: {
          createMany: stub().resolves({ count: 2 }),
          create: stub().resolves(),
          findMany: stub().resolves([
            {
              role: ContestRole.Admin,
              userId
            }
          ])
        }
      }
      return await arg(tx)
    } else if (Array.isArray(arg)) {
      // 배열 기반 트랜잭션 (e.g. importProblemsToContest)
      const updatedProblem = await db.problem.update()
      const newContestProblem = await db.contestProblem.create()
      return [newContestProblem, updatedProblem]
    } else {
      throw new Error('There is invalid transaction mock usage')
    }
  }),
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ContestService', () => {
  let service: ContestService

  beforeEach(async () => {
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
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContests', () => {
    it('should return an array of contests', async () => {
      db.contest.findMany.resolves([contestWithCount])

      const res = await service.getContests(userId, 5, 0)
      expect(res).to.deep.equal([contestWithParticipants])
    })
  })

  describe('createContest', () => {
    it('should return created contest', async () => {
      db.contest.create.resolves(contest)

      const res = await service.createContest(userId, input)
      expect(res).to.deep.equal({
        ...contest,
        userContest: [
          {
            userId,
            role: ContestRole.Admin
          }
        ]
      })
    })
  })

  describe('updateContest', () => {
    it('should return updated contest', async () => {
      db.contest.findUniqueOrThrow.resolves(contest)
      db.contest.update.resolves(contest)

      const res = await service.updateContest(19, updateInput)
      expect(res).to.deep.equal(contest)
    })
  })

  describe('deleteContest', () => {
    it('should return deleted contest', async () => {
      db.contest.findFirst.resolves(contest)
      db.contest.delete.resolves(contest)

      const res = await service.deleteContest(contestId)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when contestId not exist', async () => {
      expect(service.deleteContest(1000)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('importProblemsToContest', () => {
    const contestWithEmptySubmissions = {
      ...contest,
      submission: []
    }

    it('should return created ContestProblems', async () => {
      db.contest.findUnique.resolves(contestWithEmptySubmissions)
      db.problem.update.resolves(problem)
      db.contestProblem.create.resolves(contestProblem)
      db.contestProblem.findFirst.resolves(null)
      // eslint-disable-next-line @typescript-eslint/naming-convention
      db.contestProblem.aggregate.resolves({ _max: { order: 3 } })

      const res = await Promise.all(
        await service.importProblemsToContest(contestId, [problemIdsWithScore])
      )

      expect(res).to.deep.equal([contestProblem])
    })

    it('should return an empty array when the problem already exists in contest', async () => {
      db.contest.findUnique.resolves(contestWithEmptySubmissions)
      db.problem.update.resolves(problem)
      db.contestProblem.findFirst.resolves(ContestProblem)

      const res = await service.importProblemsToContest(contestId, [
        problemIdsWithScore
      ])

      expect(res).to.deep.equal([])
    })

    it('should throw error when the contestId not exist', async () => {
      expect(
        service.importProblemsToContest(9999, [problemIdsWithScore])
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  // describe('getContestSubmissionSummaryByUserId', () => {
  //   it('should return contest submission summaries', async () => {
  //     const res = await service.getContestSubmissionSummaryByUserId(10, 1, 1, 1)

  //     expect(res.submissions).to.deep.equal([
  //       {
  //         contestId: 1,
  //         problemTitle: 'submission',
  //         username: 'user01',
  //         studentId: '1234567890',
  //         submissionResult: ResultStatus.Accepted,
  //         language: 'C',
  //         submissionTime: '2000-01-01',
  //         codeSize: 1,
  //         ip: '127.0.0.1' // TODO: submission.ip 사용
  //       }
  //     ])
  //     expect(res.scoreSummary).to.deep.equal({
  //       totalProblemCount: 1,
  //       submittedProblemCount: 1,
  //       totalScore: 1,
  //       acceptedTestcaseCountPerProblem: [
  //         {
  //           acceptedTestcaseCount: 0,
  //           problemId: 1,
  //           totalTestcaseCount: 1
  //         }
  //       ]
  //     })
  //   })
  // })

  // describe('duplicateContest', () => {
  //   db['$transaction'] = stub().callsFake(async () => {
  //     const newContest = await db.contest.create()
  //     const newContestProblem = await db.contestProblem.create()
  //     const newContestRecord = await db.contestRecord.create()
  //     return [newContest, newContestProblem, newContestRecord]
  //   })

  //   it('should return duplicated contest', async () => {
  //     db.contest.findFirst.resolves(contest)
  //     db.contestProblem.create.resolves({
  //       ...contest,
  //       createdById: userId,
  //       groupId,
  //       isVisible: false
  //     })
  //     db.contestProblem.findMany.resolves([contestProblem])
  //     db.contestProblem.create.resolves({
  //       ...contestProblem,
  //       contestId: duplicatedContestId
  //     })
  //     db.contestRecord.findMany.resolves([contestRecord])
  //     db.contestRecord.create.resolves({
  //       ...contestRecord,
  //       contestId: duplicatedContestId
  //     })

  //     const res = await service.duplicateContest(groupId, contestId, userId)
  //     expect(res.contest).to.deep.equal(contest)
  //     expect(res.problems).to.deep.equal([
  //       {
  //         ...contestProblem,
  //         contestId: duplicatedContestId
  //       }
  //     ])
  //     expect(res.records).to.deep.equal([
  //       { ...contestRecord, contestId: duplicatedContestId }
  //     ])
  //   })

  //   it('should throw error when the contestId not exist', async () => {
  //     expect(
  //       service.duplicateContest(groupId, 9999, userId)
  //     ).to.be.rejectedWith(EntityNotExistException)
  //   })

  //   it('should throw error when the groupId not exist', async () => {
  //     expect(
  //       service.duplicateContest(9999, contestId, userId)
  //     ).to.be.rejectedWith(EntityNotExistException)
  //   })
  // })
})
