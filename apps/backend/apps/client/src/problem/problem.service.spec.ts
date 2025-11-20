import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { Prisma, ResultStatus } from '@prisma/client'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { stub } from 'sinon'
import { ForbiddenAccessException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { AssignmentService } from '@client/assignment/assignment.service'
import { ContestService } from '@client/contest/contest.service'
import { GroupService } from '@client/group/group.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { _ProblemsResponseDto } from './dto/problems.response.dto'
import { _RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { _RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import {
  assignmentProblems,
  assignmentProblemsWithScore,
  contestProblems,
  contestProblemsWithScore,
  mockUpdateHistory,
  problems,
  problemTag,
  tag,
  workbookProblems
} from './mock/problem.mock'
import {
  AssignmentProblemService,
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

const prismaNotFoundError = new Prisma.PrismaClientKnownRequestError(
  "Can't perform the action because the target record doesn't exist",
  {
    code: 'P2025',
    clientVersion: '5.1.1'
  }
)

const ARBITRARY_VAL = 1
const problemId = ARBITRARY_VAL
const groupId = ARBITRARY_VAL
const userId = ARBITRARY_VAL
const contestId = ARBITRARY_VAL
const assignmentId = ARBITRARY_VAL
const workbookId = ARBITRARY_VAL
const mockProblem = Object.assign({}, problems[0])
const mockProblems = problems.map((problem) => {
  return Object.assign(
    {},
    {
      ...problem,
      submission: [
        { id: 1, result: ResultStatus.Accepted },
        { id: 2, result: ResultStatus.WrongAnswer }
      ],
      problemTag: [{ tagId: 1 }],
      submissionCount: 10,
      acceptedRate: 0.5
    }
  )
})

const mockContest = {
  id: contestId,
  createdById: 1,
  title: 'Mock Contest Title',
  description: 'Mock Contest Description',
  penalty: 20,
  lastPenalty: false,
  registerDueTime: faker.date.past(),
  unfreeze: false,
  enableCopyPaste: true,
  evaluateWithSampleTestcase: false,
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  posterUrl: null,
  summary: {},
  freezeTime: null,
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  invitationCode: 123456,
  isJudgeResultVisible: true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: { contestRecord: 0 },
  contestProblem: [],
  submission: [],
  announcement: [],
  userContest: [],
  contestRecord: []
}

const mockContestProblem = {
  ...Object.assign({}, contestProblems[0]),
  problem: Object.assign({ tags: [tag] }, mockProblems[0])
}

const mockContestProblems = contestProblems.map((contestProblem) => {
  return {
    ...contestProblem,
    problem: Object.assign({}, mockProblems[0])
  }
})

const mockContestProblemsWithScore = contestProblemsWithScore.map(
  (contestProblem) => {
    return {
      ...contestProblem,
      problem: Object.assign({}, mockProblems[0]),
      contest: {
        startTime: new Date()
      },
      maxScore: 0,
      submissionTime: null
    }
  }
)

const mockAssignment = {
  problemCount: 10,
  id: 1,
  week: 1,
  title: 'Sample Assignment',
  description: 'This is a sample assignment.',
  isVisible: true,
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  dueTime: faker.date.future(),
  isJudgeResultVisible: true,
  enableCopyPaste: false,
  autoFinalizeScore: false,
  isFinalScoreVisible: true,
  group: {
    id: 1,
    groupName: 'Sample Group'
  }
}

const mockAssignmentProblem = {
  ...Object.assign({}, assignmentProblems[0]),
  problem: Object.assign({ tags: [tag] }, mockProblems[0])
}

const mockAssignmentProblems = assignmentProblems.map((assignmentProblem) => {
  return { ...assignmentProblem, problem: Object.assign({}, mockProblems[0]) }
})

const mockAssignmentProblemsWithScore = assignmentProblemsWithScore.map(
  (assignmentProblem) => {
    return {
      ...assignmentProblem,
      problem: Object.assign({}, mockProblems[0]),
      assignment: {
        startTime: new Date()
      },
      maxScore: 0
    }
  }
)

const mockWorkbookProblem = {
  ...Object.assign({}, workbookProblems[0]),
  problem: Object.assign({ tags: [tag] }, mockProblems[0])
}

const mockWorkbookProblems = workbookProblems.map((workbookProblem) => {
  return {
    ...workbookProblem,
    problem: Object.assign({}, mockProblems[0]),
    maxScore: null,
    score: null,
    submissionTime: null
  }
})

const mockProblemTag = Object.assign({}, problemTag)
const mockTag = Object.assign({}, tag)

const db = {
  problem: {
    findMany: stub(),
    findFirst: stub(),
    findUniqueOrThrow: stub(),
    count: stub().resolves(mockProblems.length)
  },
  contestProblem: {
    findMany: stub(),
    findUniqueOrThrow: stub(),
    count: stub().resolves(mockContestProblems.length)
  },
  assignmentProblem: {
    findMany: stub(),
    findUniqueOrThrow: stub(),
    count: stub().resolves(mockAssignmentProblems.length)
  },
  assignmentRecord: {
    findUnique: stub(),
    findFirst: stub()
  },
  assignmentProblemRecord: {
    findMany: stub()
  },
  workbookProblem: {
    findMany: stub(),
    findUniqueOrThrow: stub(),
    count: stub().resolves(mockWorkbookProblems.length)
  },
  tag: {
    findMany: stub()
  },
  problemTag: {
    findMany: stub()
  },
  contest: {
    findUniqueOrThrow: stub(),
    findFirst: stub()
  },
  assignment: {
    findUniqueOrThrow: stub(),
    findFirst: stub()
  },
  workbook: {
    findUniqueOrThrow: stub(),
    findFirst: stub(),
    count: stub()
  },
  user: {
    findUniqueOrThrow: stub()
  },
  submission: {
    findMany: stub()
  },
  updateHistory: {
    findMany: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ProblemService', () => {
  let service: ProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getProblems', () => {
    it('should return public problems', async () => {
      // given
      db.problem.findMany.resolves(mockProblems)
      db.tag.findMany.resolves([mockTag])

      // when
      const result = await service.getProblems({
        userId: null,
        cursor: 1,
        take: 2
      })

      // then
      expect(result).to.deep.equal(
        plainToInstance(_ProblemsResponseDto, {
          data: [
            {
              ...mockProblems[0],
              submissionCount: 10,
              acceptedRate: 0.5,
              tags: [mockProblemTag.tag],
              hasPassed: null
            },
            {
              ...mockProblems[1],
              submissionCount: 10,
              acceptedRate: 0.5,
              tags: [mockProblemTag.tag],
              hasPassed: null
            }
          ],
          total: 2
        })
      )
    })
  })

  describe('getProblem', () => {
    it('should return the public problem', async () => {
      // given
      db.problem.findUniqueOrThrow.resolves(mockProblem)
      db.problemTag.findMany.resolves([mockProblemTag])

      // when
      const result = await service.getProblem(problemId)

      // then
      expect(result).to.deep.equal(
        plainToInstance(ProblemResponseDto, {
          ...mockProblem,
          tags: [mockProblemTag.tag]
        })
      )
    })

    it('should throw PrismaClientKnownRequestError when the problem does not exist', async () => {
      // given
      // db.problem.findUnique.resolves(null)
      db.problem.findUniqueOrThrow.rejects(prismaNotFoundError)

      // then
      await expect(service.getProblem(problemId)).to.be.rejectedWith(
        prismaNotFoundError
      )
    })
  })

  describe('getProblemUpdateHistory', () => {
    it('should return the update history of problem', async () => {
      db.problem.findUniqueOrThrow.resolves(mockProblem)
      db.updateHistory.findMany.resolves(mockUpdateHistory)

      const result = await service.getProblemUpdateHistory(problemId)

      expect(result).to.deep.equal(mockUpdateHistory)
    })
  })
})

describe('ContestProblemService', () => {
  let service: ContestProblemService
  let contestService: ContestService

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestProblemService,
        ContestService,
        GroupService,
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        },
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<ContestProblemService>(ContestProblemService)
    contestService = module.get<ContestService>(ContestService)
  })

  afterEach(() => {
    db.contestProblem.findMany.reset()
    db.contestProblem.findUniqueOrThrow.reset()
    db.submission.findMany.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(contestService).to.be.ok
  })

  describe('getContestProblems', () => {
    beforeEach(() => {
      db.contest.findUniqueOrThrow.resolves(mockContest)
      db.contest.findFirst.resolves(null)
    })

    it('should return contest problems', async () => {
      // given
      const publicContest = {
        ...mockContest,
        endTime: faker.date.past(),
        contestRecord: []
      }
      db.contest.findUniqueOrThrow.resolves(publicContest)
      db.contestProblem.findMany.resolves(mockContestProblems)
      db.submission.findMany.resolves([])
      db.contestProblem.count.resolves(mockContestProblems.length)

      // when
      const result = await service.getContestProblems({
        contestId,
        userId,
        cursor: 1,
        take: 1
      })

      // then
      expect(result).to.deep.equal(
        // Deprecated
        plainToInstance(_RelatedProblemsResponseDto, {
          data: mockContestProblemsWithScore,
          total: mockContestProblems.length
        })
      )
    })

    it('should return contest problems when user is a Reviewer before contest start', async () => {
      const reviewerContest = {
        ...mockContest,
        startTime: faker.date.future(),
        userContest: [{ role: 'Reviewer' }]
      }
      db.contest.findUniqueOrThrow.resolves(reviewerContest)
      db.contestProblem.findMany.resolves(mockContestProblems)
      db.submission.findMany.resolves([])
      db.contestProblem.count.resolves(mockContestProblems.length)

      const result = await service.getContestProblems({
        contestId,
        userId,
        cursor: 1,
        take: 1
      })

      expect(result).to.be.ok
    })

    it('should throw PrismaClientKnownRequestError when the contest is not visible', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.rejects(prismaNotFoundError)

      // then
      await expect(
        service.getContestProblems({
          contestId,
          userId,
          cursor: 1,
          take: 1
        })
      ).to.be.rejectedWith(prismaNotFoundError)

      getContestSpy.restore()
    })

    it('should throw ForbiddenAccessException when the user is registered but contest is not started', async () => {
      const upcomingContest = {
        ...mockContest,
        startTime: faker.date.future(),
        isRegistered: true,
        isPrivilegedRole: false
      }
      db.contest.findUniqueOrThrow.resolves(upcomingContest)

      await expect(
        service.getContestProblems({
          contestId,
          userId,
          cursor: 1,
          take: 1
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw ForbiddenAccessException when the user is not registered and contest is not ended', async () => {
      const ongoingContest = {
        ...mockContest,
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: false,
        isPrivilegedRole: false
      }
      db.contest.findUniqueOrThrow.resolves(ongoingContest)

      await expect(
        service.getContestProblems({
          contestId,
          userId,
          cursor: 1,
          take: 1
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getContestProblem', () => {
    it('should return the contest problem', async () => {
      // given
      const contestMock = {
        ...mockContest,
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        contestRecord: [{ userId }],
        userContest: [],
        invitationCode: 123456
      }
      db.contest.findUniqueOrThrow.resolves(contestMock)
      db.contest.findFirst.resolves(null)
      db.contestProblem.findUniqueOrThrow.resolves(mockContestProblem)
      db.updateHistory.findMany.resolves(mockUpdateHistory)
      db.problemTag.findMany.resolves([])

      // when
      const result = await service.getContestProblem({
        contestId,
        problemId,
        userId
      })

      // then
      expect(result).to.have.property('order', mockContestProblem.order)
      expect(result).to.have.property('updateHistory', mockUpdateHistory)
    })

    it('should return the contest problem when user is a Reviewer before contest start', async () => {
      // given
      const contestMock = {
        ...mockContest,
        id: contestId,
        startTime: faker.date.future(),
        endTime: faker.date.future(),
        contestRecord: [],
        userContest: [{ role: 'Reviewer' }],
        isJudgeResultVisible: true,
        invitationCode: 123456
      }
      db.contest.findUniqueOrThrow.resolves(contestMock)
      db.contest.findFirst.resolves(null)

      db.contestProblem.findUniqueOrThrow.resolves(mockContestProblem)
      db.updateHistory.findMany.resolves(mockUpdateHistory)
      db.problemTag.findMany.resolves([])

      // when
      const result = await service.getContestProblem({
        contestId,
        problemId,
        userId
      })

      // then
      expect(result).to.have.property('order', mockContestProblem.order)
      expect(result).to.have.property('updateHistory', mockUpdateHistory)
    })

    it('should throw PrismaClientKnownRequestError when the contest is not visible', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.rejects(prismaNotFoundError)

      // then
      await expect(
        service.getContestProblem({
          contestId,
          problemId,
          userId
        })
      ).to.be.rejectedWith(prismaNotFoundError)

      getContestSpy.restore()
    })

    it('should throw ForbiddenAccessException when the user is registered but contest is not started', async () => {
      const contestMock = {
        ...mockContest,
        id: contestId,
        startTime: faker.date.future(),
        endTime: faker.date.future(),
        contestRecord: [{ userId }],
        userContest: [],
        isJudgeResultVisible: true,
        invitationCode: 123456
      }
      db.contest.findUniqueOrThrow.resolves(contestMock)
      db.contest.findFirst.resolves(null)

      db.contestProblem.findUniqueOrThrow.resolves(mockContestProblem)
      await expect(
        service.getContestProblem({
          contestId,
          problemId,
          userId
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw ForbiddenAccessException when the user is not registered and contest is not ended', async () => {
      const contestMock = {
        ...mockContest,
        id: contestId,
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        contestRecord: [],
        userContest: [],
        isJudgeResultVisible: true,
        invitationCode: 123456
      }
      db.contest.findUniqueOrThrow.resolves(contestMock)
      db.contest.findFirst.resolves(null)

      db.contestProblem.findUniqueOrThrow.resolves(mockContestProblem)
      await expect(
        service.getContestProblem({
          contestId,
          problemId,
          userId
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})

describe('AssignmentProblemService', () => {
  let service: AssignmentProblemService
  let assignmentService: AssignmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentProblemService,
        AssignmentService,
        GroupService,
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        },
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<AssignmentProblemService>(AssignmentProblemService)
    assignmentService = module.get<AssignmentService>(AssignmentService)

    db.assignment.findUniqueOrThrow.resetBehavior()
    db.assignmentRecord.findFirst.resetBehavior()
  })

  afterEach(() => {
    db.assignmentProblem.findMany.reset()
    db.assignmentProblem.findUniqueOrThrow.reset()
    db.submission.findMany.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(assignmentService).to.be.ok
  })

  describe('getAssignmentProblems', () => {
    it('should return public assignment problems', async () => {
      const getAssignmentSpy = stub(assignmentService, 'getAssignment')
      getAssignmentSpy.resolves(mockAssignment)
      db.assignmentProblem.findMany.resolves(mockAssignmentProblems)
      db.submission.findMany.resolves([])
      db.assignmentProblemRecord.findMany.resolves([
        { problemId: 1, score: null }
      ])

      const result = await service.getAssignmentProblems({
        assignmentId,
        userId,
        cursor: 1,
        take: 1
      })

      expect(result).to.deep.equal({
        data: [
          {
            acceptedRate: 0.5,
            difficulty: 'Level1',
            id: 1,
            maxScore: 0,
            order: 1,
            submissionCount: 10,
            title: 'public problem'
          },
          {
            acceptedRate: 0.5,
            difficulty: 'Level1',
            id: 1,
            maxScore: 0,
            order: 2,
            submissionCount: 10,
            title: 'public problem'
          }
        ],
        total: mockAssignmentProblemsWithScore.length
      })
    })

    it('should return group assignment problems', async () => {
      const getAssignmentSpy = stub(assignmentService, 'getAssignment')
      getAssignmentSpy.resolves(mockAssignment)
      db.assignmentProblem.findMany.resolves(mockAssignmentProblems)
      db.submission.findMany.resolves([])
      db.assignmentProblemRecord.findMany.resolves([
        { problemId: 1, score: null }
      ])

      const result = await service.getAssignmentProblems({
        assignmentId,
        userId,
        cursor: 1,
        take: 1
      })

      expect(result).to.deep.equal({
        data: [
          {
            acceptedRate: 0.5,
            difficulty: 'Level1',
            id: 1,
            maxScore: 0,
            order: 1,
            submissionCount: 10,
            title: 'public problem'
          },
          {
            acceptedRate: 0.5,
            difficulty: 'Level1',
            id: 1,
            maxScore: 0,
            order: 2,
            submissionCount: 10,
            title: 'public problem'
          }
        ],
        total: mockAssignmentProblemsWithScore.length
      })
    })

    it('should throw PrismaClientKnownRequestError when the assignment is not visible', async () => {
      const getAssignmentSpy = stub(assignmentService, 'getAssignment')
      getAssignmentSpy.rejects(prismaNotFoundError)

      await expect(
        service.getAssignmentProblems({
          assignmentId,
          userId,
          cursor: 1,
          take: 1
        })
      ).to.be.rejectedWith(prismaNotFoundError)
    })

    it('should throw ForbiddenAccessException when the user is not registered and assignment is not ended', async () => {
      db.assignmentProblem.findMany.resolves(mockAssignmentProblems)

      await expect(
        service.getAssignmentProblems({
          assignmentId,
          userId: 999,
          cursor: 1,
          take: 1
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getAssignmentProblem', () => {
    it('should return the public assignment problem', async () => {
      const getAssignmentSpy = stub(assignmentService, 'getAssignment')
      getAssignmentSpy.resolves(mockAssignment)
      db.assignmentProblem.findUniqueOrThrow.resolves(mockAssignmentProblem)
      db.problemTag.findMany.resolves([{ tag: mockTag }])

      const result = await service.getAssignmentProblem({
        assignmentId,
        problemId,
        userId
      })
      expect(result).to.be.deep.equal(
        // Deprecated
        plainToInstance(_RelatedProblemResponseDto, {
          ...mockAssignmentProblem,
          problem: { ...mockAssignmentProblem.problem, tags: [mockTag] }
        })
      )
      db.problemTag.findMany.resetBehavior()
    })

    it('should return the group assignment problem', async () => {
      const getAssignmentSpy = stub(assignmentService, 'getAssignment')
      getAssignmentSpy.resolves(mockAssignment)
      db.assignmentProblem.findUniqueOrThrow.resolves(mockAssignmentProblem)
      db.problemTag.findMany.resolves([{ tag: mockTag }])

      const result = await service.getAssignmentProblem({
        assignmentId,
        problemId,
        userId
      })
      expect(result).to.be.deep.equal(
        // Deprecated
        plainToInstance(_RelatedProblemResponseDto, {
          ...mockAssignmentProblem,
          problem: { ...mockAssignmentProblem.problem, tags: [mockTag] }
        })
      )

      db.problemTag.findMany.resetBehavior()
    })

    it('should throw PrismaClientKnownRequestError when the assignment is not visible', async () => {
      // given
      const getAssignmentSpy = stub(assignmentService, 'getAssignment')
      getAssignmentSpy.rejects(prismaNotFoundError)

      // then
      await expect(
        service.getAssignmentProblem({
          assignmentId,
          problemId,
          userId
        })
      ).to.be.rejectedWith(prismaNotFoundError)
    })

    it('should throw ForbiddenAccessException when the user is not registered and assignment is not ended', async () => {
      db.assignmentRecord.findFirst.resolves(null)
      db.assignmentProblem.findUniqueOrThrow.resolves(mockAssignmentProblem)

      await expect(
        service.getAssignmentProblem({
          assignmentId,
          problemId,
          userId: 999
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})

describe('WorkbookProblemService', () => {
  let service: WorkbookProblemService
  let workbookService: WorkbookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbookProblemService,
        WorkbookService,
        GroupService,
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

    service = module.get<WorkbookProblemService>(WorkbookProblemService)
    workbookService = module.get<WorkbookService>(WorkbookService)

    db.workbook.findFirst.resetBehavior()
    db.problemTag.findMany.resetBehavior()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(workbookService).to.be.ok
  })

  describe('getWorkbookProblems', () => {
    it('should return public workbook problems', async () => {
      // given
      const isVisibleSpy = stub(workbookService, 'isVisible').resolves(true)
      const mockWorkbookProblemData = mockWorkbookProblems.map((p) => ({
        order: p.order,
        problem: p.problem
      }))
      db.workbookProblem.findMany.resolves(mockWorkbookProblemData)
      db.workbookProblem.count.resolves(mockWorkbookProblems.length)

      // when
      const result = await service.getWorkbookProblems({
        workbookId,
        cursor: 1,
        take: 1,
        groupId
      })

      // then
      expect(result).to.deep.equal({
        data: mockWorkbookProblems.map((p) => ({
          order: p.order,
          maxScore: null,
          score: null,
          submissionTime: null,
          id: p.problem.id,
          title: p.problem.title,
          difficulty: p.problem.difficulty,
          submissionCount: p.problem.submissionCount,
          acceptedRate: p.problem.acceptedRate,
          isHiddenUploadedByZip: p.problem.isHiddenUploadedByZip,
          isSampleUploadedByZip: p.problem.isSampleUploadedByZip,
          updateContentTime: p.problem.updateContentTime
        })),
        total: mockWorkbookProblems.length
      })
      isVisibleSpy.restore()
    })

    it('should return group workbook problems', async () => {
      // given
      const isVisibleSpy = stub(workbookService, 'isVisible').resolves(true)
      const mockWorkbookProblemData = mockWorkbookProblems.map((p) => ({
        order: p.order,
        problem: p.problem
      }))
      db.workbookProblem.findMany.resolves(mockWorkbookProblemData)
      db.workbookProblem.count.resolves(mockWorkbookProblems.length)

      // when
      const result = await service.getWorkbookProblems({
        workbookId,
        cursor: 1,
        take: 1,
        groupId
      })

      // then
      expect(result).to.deep.equal({
        data: mockWorkbookProblems.map((p) => ({
          order: p.order,
          maxScore: null,
          score: null,
          submissionTime: null,
          id: p.problem.id,
          title: p.problem.title,
          difficulty: p.problem.difficulty,
          submissionCount: p.problem.submissionCount,
          acceptedRate: p.problem.acceptedRate,
          isHiddenUploadedByZip: p.problem.isHiddenUploadedByZip,
          isSampleUploadedByZip: p.problem.isSampleUploadedByZip,
          updateContentTime: p.problem.updateContentTime
        })),
        total: mockWorkbookProblems.length
      })
      isVisibleSpy.restore()
    })

    it('should throw ForbiddenAccessException when the workbook is not visible', async () => {
      // given
      const isVisibleSpy = stub(workbookService, 'isVisible').resolves(false)

      // then
      await expect(
        service.getWorkbookProblems({
          workbookId,
          cursor: 1,
          take: 1,
          groupId
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
      isVisibleSpy.restore()
    })
  })

  describe('getWorkbookProblem', () => {
    it('should return the public workbook problem', async () => {
      // given
      const isVisibleSpy = stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findUniqueOrThrow.resolves(mockWorkbookProblem)
      db.problemTag.findMany.resolves([{ tag: mockTag }])

      // when
      const result = await service.getWorkbookProblem(
        workbookId,
        problemId,
        groupId
      )

      // then
      expect(result).to.be.deep.equal(
        // Deprecated
        plainToInstance(_RelatedProblemResponseDto, {
          ...mockWorkbookProblem,
          problem: { ...mockWorkbookProblem.problem, tags: [mockTag] }
        })
      )
      isVisibleSpy.restore()
    })

    it('should return the group workbook problem', async () => {
      // given
      const isVisibleSpy = stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findUniqueOrThrow.resolves(mockWorkbookProblem)
      db.problemTag.findMany.resolves([{ tag: mockTag }])

      // when
      const result = await service.getWorkbookProblem(
        workbookId,
        problemId,
        groupId
      )

      // then
      expect(result).to.be.deep.equal(
        // Deprecated
        plainToInstance(_RelatedProblemResponseDto, {
          ...mockWorkbookProblem,
          problem: { ...mockWorkbookProblem.problem, tags: [mockTag] }
        })
      )
      isVisibleSpy.restore()
    })

    it('should throw ForbiddenAccessException when the workbook is not visible', async () => {
      // given
      const isVisibleSpy = stub(workbookService, 'isVisible').resolves(false)

      // then
      await expect(
        service.getWorkbookProblem(workbookId, problemId, groupId)
      ).to.be.rejectedWith(ForbiddenAccessException)
      isVisibleSpy.restore()
    })
  })
})
