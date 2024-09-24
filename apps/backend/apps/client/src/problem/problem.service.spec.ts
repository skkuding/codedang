// problem.service.spec.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { ResultStatus } from '@prisma/client'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { stub } from 'sinon'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'
import { GroupService } from '@client/group/group.service'
import { WorkbookService } from '@client/workbook/workbook.service'
import { CodeDraftResponseDto } from './dto/code-draft.response.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import {
  contestProblems,
  problemTag,
  problems,
  workbookProblems,
  mockUser,
  mockTemplate,
  tag,
  mockCodeDraft,
  contestProblemsWithScore
} from './mock/problem.mock'
import { ProblemRepository } from './problem.repository'
import {
  ContestProblemService,
  ProblemService,
  CodeDraftService,
  WorkbookProblemService
} from './problem.service'

const db = {
  problem: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub(),
    count: stub().resolves(2)
  },
  contestProblem: {
    findMany: stub(),
    findUnique: stub(),
    count: stub().resolves(2)
  },
  workbookProblem: {
    findMany: stub(),
    findUnique: stub(),
    count: stub().resolves(2)
  },
  tag: {
    findMany: stub()
  },
  problemTag: {
    findMany: stub()
  },
  contest: {
    findUniqueOrThrow: stub()
  },
  user: {
    findUniqueOrThrow: stub()
  },
  submission: {
    findMany: stub()
  },
  codeDraft: {
    findMany: stub(),
    findUnique: stub(),
    upsert: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

const ARBITRARY_VAL = 1
const problemId = ARBITRARY_VAL
const groupId = ARBITRARY_VAL
const userId = ARBITRARY_VAL
const contestId = ARBITRARY_VAL
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
      problemTag: [{ tagId: 1 }]
    }
  )
})

const mockContestProblem = {
  ...Object.assign({}, contestProblems[0]),
  problem: Object.assign({}, mockProblems[0])
}

const mockContestProblems = contestProblems.map((contestProblem) => {
  return { ...contestProblem, problem: Object.assign({}, mockProblems[0]) }
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

const mockWorkbookProblem = {
  ...Object.assign({}, workbookProblems[0]),
  problem: Object.assign({}, mockProblems[0])
}

const mockWorkbookProblems = workbookProblems.map((workbookProblem) => {
  return { ...workbookProblem, problem: Object.assign({}, mockProblems[0]) }
})

const mockProblemTag = Object.assign({}, problemTag)
const mockTag = Object.assign({}, tag)

describe('ProblemService', () => {
  let service: ProblemService
  let problemRepository: ProblemRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        ProblemRepository,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
    problemRepository = module.get<ProblemRepository>(ProblemRepository)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(problemRepository).to.be.ok
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
        take: 2,
        groupId: OPEN_SPACE_ID
      })

      // then
      expect(result).to.deep.equal(
        plainToInstance(ProblemsResponseDto, {
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
      db.problem.findUnique.resolves(mockProblem)
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

    it('should throw EntityNotExistException when the problem does not exist', async () => {
      // given
      db.problem.findUnique.resolves(null)

      // then
      await expect(service.getProblem(problemId)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })
})

describe('ContestProblemService', () => {
  let service: ContestProblemService
  let problemRepository: ProblemRepository
  let contestService: ContestService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestProblemService,
        ContestService,
        GroupService,
        ProblemRepository,
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
    problemRepository = module.get<ProblemRepository>(ProblemRepository)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(contestService).to.be.ok
  })

  it('should be defined', () => {
    expect(problemRepository).to.be.ok
  })

  describe('getContestProblems', () => {
    it('should return public contest problems', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: true,
        invitationCodeExists: true,
        isJudgeResultVisible: true
      })
      db.contestProblem.findMany.resolves(mockContestProblems)
      db.submission.findMany.resolves([])

      // when
      const result = await service.getContestProblems(contestId, userId, 1, 1)

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, {
          data: mockContestProblemsWithScore,
          total: 2
        })
      )
    })

    it('should return group contest problems', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: true,
        invitationCodeExists: true,
        isJudgeResultVisible: true
      })
      db.contestProblem.findMany.resolves(mockContestProblems)

      // when
      const result = await service.getContestProblems(
        contestId,
        userId,
        1,
        1,
        groupId
      )

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, {
          data: mockContestProblemsWithScore,
          total: 2
        })
      )
    })

    it('should throw EntityNotExistException when the contest is not visible', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.rejects(new EntityNotExistException('Contest'))

      // then
      await expect(
        service.getContestProblems(contestId, userId, 1, 1)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw ForbiddenAccessException when the user is registered but contest is not started', async () => {
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.future(),
        endTime: faker.date.future(),
        isRegistered: true,
        isJudgeResultVisible: true,
        invitationCodeExists: true
      })
      db.contestProblem.findMany.resolves(mockContestProblems)

      await expect(
        service.getContestProblems(contestId, userId, 1, 1)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw ForbiddenAccessException when the user is not registered and contest is not ended', async () => {
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: false,
        isJudgeResultVisible: true,
        invitationCodeExists: true
      })
      db.contestProblem.findMany.resolves(mockContestProblems)

      await expect(
        service.getContestProblems(contestId, 0, 1, 1)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getContestProblem', () => {
    it('should return the public contest problem', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: true,
        isJudgeResultVisible: true,
        invitationCodeExists: true
      })
      db.contestProblem.findUnique.resolves(mockContestProblem)

      // when
      const result = await service.getContestProblem(
        contestId,
        problemId,
        userId
      )

      // then
      expect(result).to.be.deep.equal(
        plainToInstance(RelatedProblemResponseDto, mockContestProblem)
      )
    })

    it('should return the group contest problem', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: true,
        isJudgeResultVisible: true,
        invitationCodeExists: true
      })
      db.contestProblem.findUnique.resolves(mockContestProblem)

      // when
      const result = await service.getContestProblem(
        contestId,
        problemId,
        groupId
      )

      // then
      expect(result).to.be.deep.equal(
        plainToInstance(RelatedProblemResponseDto, mockContestProblem)
      )
    })

    it('should throw EntityNotExistException when the contest is not visible', async () => {
      // given
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.rejects(new EntityNotExistException('Contest'))

      // then
      await expect(
        service.getContestProblem(contestId, problemId, userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw ForbiddenAccessException when the user is registered but contest is not started', async () => {
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.future(),
        endTime: faker.date.future(),
        isRegistered: true,
        isJudgeResultVisible: true,
        invitationCodeExists: true
      })
      db.contestProblem.findUnique.resolves(mockContestProblem)
      await expect(
        service.getContestProblem(contestId, problemId, userId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw ForbiddenAccessException when the user is not registered and contest is not ended', async () => {
      const getContestSpy = stub(contestService, 'getContest')
      getContestSpy.resolves({
        startTime: faker.date.past(),
        endTime: faker.date.future(),
        isRegistered: false,
        isJudgeResultVisible: true,
        invitationCodeExists: true
      })
      db.contestProblem.findUnique.resolves(mockContestProblem)
      await expect(
        service.getContestProblem(contestId, problemId, userId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})

describe('WorkbookProblemService', () => {
  let service: WorkbookProblemService
  let problemRepository: ProblemRepository
  let workbookService: WorkbookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbookProblemService,
        WorkbookService,
        GroupService,
        ProblemRepository,
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
    problemRepository = module.get<ProblemRepository>(ProblemRepository)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(workbookService).to.be.ok
  })

  it('should be defined', () => {
    expect(problemRepository).to.be.ok
  })

  describe('getWorkbookProblems', () => {
    it('should return public workbook problems', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findMany.resolves(mockWorkbookProblems)

      // when
      const result = await service.getWorkbookProblems(workbookId, 1, 1)

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, {
          data: mockWorkbookProblems,
          total: 2
        })
      )
    })

    it('should return group workbook problems', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findMany.resolves(mockWorkbookProblems)

      // when
      const result = await service.getWorkbookProblems(
        workbookId,
        1,
        1,
        groupId
      )

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, {
          data: mockWorkbookProblems,
          total: 2
        })
      )
    })

    it('should throw ForbiddenAccessException when the workbook is not visible', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(false)

      // then
      await expect(
        service.getWorkbookProblems(workbookId, 1, 1)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getWorkbookProblem', () => {
    it('should return the public workbook problem', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findUnique.resolves(mockWorkbookProblem)

      // when
      const result = await service.getWorkbookProblem(workbookId, problemId)

      // then
      expect(result).to.be.deep.equal(
        plainToInstance(RelatedProblemResponseDto, mockWorkbookProblem)
      )
    })

    it('should return the group workbook problem', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findUnique.resolves(mockWorkbookProblem)

      // when
      const result = await service.getWorkbookProblem(
        workbookId,
        problemId,
        groupId
      )

      // then
      expect(result).to.be.deep.equal(
        plainToInstance(RelatedProblemResponseDto, mockWorkbookProblem)
      )
    })

    it('should throw ForbiddenAccessException when the workbook is not visible', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(false)

      // then
      await expect(
        service.getWorkbookProblem(workbookId, problemId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})

describe('CodeDraftService', () => {
  let service: CodeDraftService
  let problemRepository: ProblemRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeDraftService,
        ProblemRepository,
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

    service = module.get<CodeDraftService>(CodeDraftService)
    problemRepository = module.get<ProblemRepository>(ProblemRepository)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  it('should be defined', () => {
    expect(problemRepository).to.be.ok
  })

  describe('getCodeDraft', () => {
    it('should return Code Draft', async () => {
      // given
      db.codeDraft.findUnique.resolves(mockCodeDraft)
      // when
      const result = await service.getCodeDraft(mockUser.id, mockProblem.id)

      // then
      expect(result).to.deep.equal(
        plainToInstance(CodeDraftResponseDto, mockCodeDraft)
      )
    })

    it('should throw EntityNotExistException when the code draft does not exist', async () => {
      // given
      db.codeDraft.findUnique.resolves(null)
      // then
      await expect(
        service.getCodeDraft(mockUser.id, mockProblem.id)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('upsertCodeDraft', () => {
    it('should upsert code draft', async () => {
      // given
      db.codeDraft.upsert.resolves(mockCodeDraft)
      // when
      const result = await service.upsertCodeDraft(
        mockUser.id,
        mockProblem.id,
        mockTemplate
      )

      // then
      expect(result).to.deep.equal(
        plainToInstance(CodeDraftResponseDto, mockCodeDraft)
      )
    })

    it('should throw EntityNotExistException when the user or problem does not exist', async () => {
      // given
      db.codeDraft.upsert.rejects(
        new EntityNotExistException('User or Problem')
      )
      // then
      await expect(
        service.upsertCodeDraft(mockUser.id, mockProblem.id, mockTemplate)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
