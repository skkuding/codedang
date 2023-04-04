import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import * as dayjs from 'dayjs'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'
import { ProblemRepository } from './problem.repository'
import {
  contestProblems,
  problems,
  workbookProblems
} from './mock/problem.mock'
import { PrismaService } from '@client/prisma/prisma.service'
import { type PaginationDto } from '@client/common/dto/pagination.dto'
import { plainToInstance } from 'class-transformer'
import { ProblemsResponseDto } from './dto/problems.response.dto'
import { ProblemResponseDto } from './dto/problem.response.dto'
import { RelatedProblemsResponseDto } from './dto/related-problems.response.dto'
import { ContestService } from '@client/contest/contest.service'
import { GroupService } from '@client/group/group.service'
import { CACHE_MANAGER } from '@nestjs/common'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@client/common/exception/business.exception'
import { RelatedProblemResponseDto } from './dto/related-problem.response.dto'
import { WorkbookService } from '@client/workbook/workbook.service'

const db = {
  problem: {
    findMany: stub(),
    findFirst: stub()
  },
  contestProblem: {
    findMany: stub(),
    findUnique: stub()
  },
  workbookProblem: {
    findMany: stub(),
    findUnique: stub()
  }
}

const ARBITRARY_VAL = 1
const problemId = ARBITRARY_VAL
const groupId = ARBITRARY_VAL
const contestId = ARBITRARY_VAL
const workbookId = ARBITRARY_VAL
const mockProblems = problems.map((problem) => {
  return Object.assign({}, problem)
})

const mockProblem = Object.assign({}, mockProblems[0])

const mockContestProblem = {
  ...Object.assign({}, contestProblems[0]),
  problem: Object.assign({}, mockProblems[0])
}

const mockContestProblems = contestProblems.map((contestProblem) => {
  return { ...contestProblem, problem: Object.assign({}, mockProblems[0]) }
})

const mockWorkbookProblem = {
  ...Object.assign({}, workbookProblems[0]),
  problem: Object.assign({}, mockProblems[0])
}

const mockWorkbookProblems = workbookProblems.map((workbookProblem) => {
  return { ...workbookProblem, problem: Object.assign({}, mockProblems[0]) }
})

const paginationDto: PaginationDto = {
  offset: 0,
  limit: 10
}

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

      // when
      const result = await service.getProblems(paginationDto)

      // then
      expect(result).to.deep.equal(
        plainToInstance(ProblemsResponseDto, mockProblems)
      )
    })
  })

  describe('getProblem', () => {
    it('should return the public problem', async () => {
      // given
      db.problem.findFirst.resolves(mockProblem)

      // when
      const result = await service.getProblem(problemId)

      // then
      expect(result).to.deep.equal(
        plainToInstance(ProblemResponseDto, mockProblem)
      )
    })

    it('should throw error when the problem does not exist', async () => {
      // given
      db.problem.findFirst.rejects(new EntityNotExistException('Problem'))

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
      stub(contestService, 'isVisible').resolves(true)
      db.contestProblem.findMany.resolves(mockContestProblems)

      // when
      const result = await service.getContestProblems(contestId, paginationDto)

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, mockContestProblems)
      )
    })

    it('should return group contest problems', async () => {
      // given
      stub(contestService, 'isVisible').resolves(true)
      db.contestProblem.findMany.resolves(mockContestProblems)

      // when
      const result = await service.getContestProblems(
        contestId,
        paginationDto,
        groupId
      )

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, mockContestProblems)
      )
    })

    it('should throw error when the contest is not visible', async () => {
      // given
      stub(contestService, 'isVisible').resolves(false)
      db.contestProblem.findMany.resolves(mockContestProblems)

      // then
      await expect(
        service.getContestProblems(contestId, paginationDto)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when the contest is not started yet', async () => {
      stub(contestService, 'isVisible').resolves(true)
      const notStartedContestProblems = mockContestProblems.map((x) => ({
        ...x,
        contest: {
          startTime: dayjs().add(1, 'day')
        }
      }))
      db.contestProblem.findMany.resolves(notStartedContestProblems)
      await expect(
        service.getContestProblems(contestId, paginationDto)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getContestProblem', () => {
    it('should return the public contest problem', async () => {
      // given
      stub(contestService, 'isVisible').resolves(true)
      db.contestProblem.findUnique.resolves(mockContestProblem)

      // when
      const result = await service.getContestProblem(contestId, problemId)

      // then
      expect(result).to.be.deep.equal(
        plainToInstance(RelatedProblemResponseDto, mockContestProblem)
      )
    })

    it('should return the group contest problem', async () => {
      // given
      stub(contestService, 'isVisible').resolves(true)
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

    it('should throw error when the contest is not visible', async () => {
      // given
      stub(contestService, 'isVisible').resolves(false)
      db.contestProblem.findUnique.resolves(mockContestProblem)

      // then
      await expect(
        service.getContestProblem(contestId, problemId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  it('should throw error when the contest is not started yet', async () => {
    stub(contestService, 'isVisible').resolves(true)
    const notStartedContestProblem = {
      ...mockContestProblem,
      contest: {
        startTime: dayjs().add(1, 'day')
      }
    }
    db.contestProblem.findUnique.resolves(notStartedContestProblem)
    await expect(
      service.getContestProblem(contestId, problemId)
    ).to.be.rejectedWith(ForbiddenAccessException)
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
      const result = await service.getWorkbookProblems(
        workbookId,
        paginationDto
      )

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, mockWorkbookProblems)
      )
    })

    it('should return group workbook problems', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(true)
      db.workbookProblem.findMany.resolves(mockWorkbookProblems)

      // when
      const result = await service.getWorkbookProblems(
        workbookId,
        paginationDto,
        groupId
      )

      // then
      expect(result).to.deep.equal(
        plainToInstance(RelatedProblemsResponseDto, mockWorkbookProblems)
      )
    })

    it('should throw error when the workbook is not visible', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(false)

      // then
      await expect(
        service.getWorkbookProblems(workbookId, paginationDto)
      ).to.be.rejectedWith(EntityNotExistException)
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

    it('should throw error when the workbook is not visible', async () => {
      // given
      stub(workbookService, 'isVisible').resolves(false)

      // then
      await expect(
        service.getWorkbookProblem(contestId, problemId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
