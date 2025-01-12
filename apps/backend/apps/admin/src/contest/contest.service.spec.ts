import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { ContestProblem, Group, ContestRecord } from '@generated'
import { Problem } from '@generated'
import { Contest } from '@generated'
import { faker } from '@faker-js/faker'
import { ResultStatus } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from './contest.service'
import type { ContestWithParticipants } from './model/contest-with-participants.model'
import type {
  CreateContestInput,
  UpdateContestInput
} from './model/contest.input'
import type { PublicizingRequest } from './model/publicizing-request.model'

const contestId = 1
const userId = 1
const groupId = 1
const problemId = 2
const startTime = faker.date.past()
const endTime = faker.date.future()
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
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime,
  updateTime,
  invitationCode,
  contestProblem: []
}

const contestWithCount = {
  id: contestId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime,
  updateTime,
  invitationCode,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    contestRecord: 10
  }
}

const contestWithParticipants: ContestWithParticipants = {
  id: contestId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  isVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  createTime,
  updateTime,
  participants: 10,
  invitationCode
}

const group: Group = {
  id: groupId,
  groupName: 'groupName',
  description: 'description',
  config: {
    showOnList: true,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const problem: Problem = {
  id: problemId,
  createdById: 2,
  groupId: 2,
  title: 'test problem',
  description: 'thisistestproblem',
  inputDescription: 'inputdescription',
  outputDescription: 'outputdescription',
  hint: 'hint',
  template: [],
  languages: ['C'],
  timeLimit: 10000,
  memoryLimit: 100000,
  difficulty: 'Level1',
  source: 'source',
  visibleLockTime: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  submissionCount: 0,
  acceptedCount: 0,
  acceptedRate: 0,
  engDescription: null,
  engHint: null,
  engInputDescription: null,
  engOutputDescription: null,
  engTitle: null
}

const contestProblem: ContestProblem = {
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

const publicizingRequest: PublicizingRequest = {
  contestId,
  userId,
  expireTime: new Date('2050-08-19T07:32:07.533Z')
}

const input = {
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  isVisible: false,
  isRankVisible: false,
  enableCopyPaste: true,
  isJudgeResultVisible: true
} satisfies CreateContestInput

const updateInput = {
  id: 1,
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  isVisible: false,
  isRankVisible: false,
  enableCopyPaste: false
} satisfies UpdateContestInput

const db = {
  contest: {
    findFirst: stub().resolves(Contest),
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
    findFirst: stub().resolves(ContestProblem)
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
  group: {
    findUnique: stub().resolves(Group)
  },
  submission: {
    findMany: stub().resolves([submissionsWithProblemTitleAndUsername])
  },
  // submissionResult: {
  //   findMany: stub().resolves([submissionResults])
  // },
  $transaction: stub().callsFake(async () => {
    const updatedProblem = await db.problem.update()
    const newContestProblem = await db.contestProblem.create()
    return [newContestProblem, updatedProblem]
  }),
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ContestService', () => {
  let service: ContestService
  let cache: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        { provide: PrismaService, useValue: db },
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
    cache = module.get<Cache>(CACHE_MANAGER)
    stub(cache.store, 'keys').resolves(['contest:1:publicize'])
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContests', () => {
    it('should return an array of contests', async () => {
      db.contest.findMany.resolves([contestWithCount])

      const res = await service.getContests(5, 2, 0)
      expect(res).to.deep.equal([contestWithParticipants])
    })
  })

  describe('getPublicizingRequests', () => {
    it('should return an array of PublicizingRequest', async () => {
      const cacheSpyGet = stub(cache, 'get').resolves([publicizingRequest])
      const res = await service.getPublicizingRequests()

      expect(cacheSpyGet.called).to.be.true
      expect(res).to.deep.equal([publicizingRequest])
    })
  })

  describe('createContest', () => {
    it('should return created contest', async () => {
      db.contest.create.resolves(contest)
      db.group.findUnique.resolves(group)

      const res = await service.createContest(groupId, userId, input)
      expect(res).to.deep.equal(contest)
    })
  })

  describe('updateContest', () => {
    it('should return updated contest', async () => {
      db.contest.findFirst.resolves(contest)
      db.contest.update.resolves(contest)

      const res = await service.updateContest(groupId, updateInput)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.updateContest(1000, updateInput)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('deleteContest', () => {
    it('should return deleted contest', async () => {
      db.contest.findFirst.resolves(contest)
      db.contest.delete.resolves(contest)

      const res = await service.deleteContest(groupId, contestId)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.deleteContest(1000, 1000)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('handlePublicizingRequest', () => {
    it('should return accepted state', async () => {
      db.contest.update.resolves(contest)

      const cacheSpyGet = stub(cache, 'get').resolves([publicizingRequest])
      const res = await service.handlePublicizingRequest(contestId, true)

      expect(cacheSpyGet.called).to.be.true
      expect(res).to.deep.equal({
        contestId,
        isAccepted: true
      })
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.handlePublicizingRequest(1000, true)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when the contest is not requested to public', async () => {
      expect(service.handlePublicizingRequest(3, true)).to.be.rejectedWith(
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

      const res = await Promise.all(
        await service.importProblemsToContest(groupId, contestId, [
          problemIdsWithScore
        ])
      )

      expect(res).to.deep.equal([contestProblem])
    })

    it('should return an empty array when the problem already exists in contest', async () => {
      db.contest.findUnique.resolves(contestWithEmptySubmissions)
      db.problem.update.resolves(problem)
      db.contestProblem.findFirst.resolves(ContestProblem)

      const res = await service.importProblemsToContest(groupId, contestId, [
        problemIdsWithScore
      ])

      expect(res).to.deep.equal([])
    })

    it('should throw error when the contestId not exist', async () => {
      expect(
        service.importProblemsToContest(groupId, 9999, [problemIdsWithScore])
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
