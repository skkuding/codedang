import { Test, TestingModule } from '@nestjs/testing'
import { plainToInstance } from 'class-transformer'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { ContestService } from 'src/contest/contest.service'
import { WorkbookService } from 'src/workbook/workbook.service'
import { ContestProblemResponseDto } from './dto/contest-problem.response.dto'
import { ContestProblemsResponseDto } from './dto/contest-problems.response.dto'
import { PublicContestProblemResponseDto } from './dto/public-contest-problem.response.dto'
import { PublicContestProblemsResponseDto } from './dto/public-contest-problems.response.dto'
import { PublicProblemResponseDto } from './dto/public-problem.response.dto'
import { PublicProblemsResponseDto } from './dto/public-problems.response.dto'
import { PublicWorkbookProblemResponseDto } from './dto/public-workbook-problem.response.dto'
import { PublicWorkbookProblemsResponseDto } from './dto/public-workbook-problems.response.dto'
import { WorkbookProblemResponseDto } from './dto/workbook-problem.response.dto'
import { WorkbookProblemsResponseDto } from './dto/workbook-problems.response.dto'
import {
  ContestProblems,
  Problems,
  WorkbookProblems
} from './mock/problem.mock'
import { ProblemRepository } from './problem.repository'
import { expect } from 'chai'
import { PrismaService } from 'src/prisma/prisma.service'

const ARBITRARY_VAL = 1
const groupId = ARBITRARY_VAL
const contestId = ARBITRARY_VAL
const workbookId = ARBITRARY_VAL
const problemId = ARBITRARY_VAL

const mockProblems = Problems.map((problem) => {
  return Object.assign({}, problem)
})
const mockPublicProblem = Object.assign({}, mockProblems[0])

const mockContestProblem = {
  ...Object.assign({}, ContestProblems[0]),
  problem: Object.assign({}, mockProblems[0])
}

const mockContestProblems = ContestProblems.map((contestProblem) => {
  return { ...contestProblem, problem: Object.assign({}, mockProblems[0]) }
})

const mockWorkbookProblem = {
  ...Object.assign({}, WorkbookProblems[0]),
  problem: Object.assign({}, mockProblems[0])
}

const mockWorkbookProblems = WorkbookProblems.map((workbookProblem) => {
  return { ...workbookProblem, problem: Object.assign({}, mockProblems[0]) }
})

const paginationDto = new PaginationDto()
paginationDto.offset = 0
paginationDto.limit = 10

const mockProblemRepository = {
  getPublicProblem: jest.fn().mockResolvedValue(undefined),
  getContestProblem: jest.fn().mockResolvedValue(undefined),
  getWorkbookProblem: jest.fn().mockResolvedValue(undefined),
  getPublicProblems: jest.fn().mockResolvedValue(undefined),
  getContestProblems: jest.fn().mockResolvedValue(undefined),
  getWorkbookProblems: jest.fn().mockResolvedValue(undefined)
}

describe('ProblemService', () => {
  let problemService: ProblemService
  let problemRepository: ProblemRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: ProblemRepository, useValue: mockProblemRepository },
        { provide: ContestService, useValue: {} },
        { provide: WorkbookService, useValue: {} }
      ]
    }).compile()

    problemService = module.get<ProblemService>(ProblemService)
    problemRepository = module.get<ProblemRepository>(ProblemRepository)
  })

  it('should be defined', () => {
    expect(problemService).toBeDefined()
  })

  describe('getPublicProblem', () => {
    afterEach(() => {
      mockProblemRepository.getPublicProblem.mockClear()
    })

    it('should return the public problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getPublicProblem')
        .mockResolvedValueOnce(mockPublicProblem)

      // when
      const result = await problemService.getPublicProblem(problemId)

      // then
      expect(result).toEqual(
        plainToInstance(PublicProblemResponseDto, mockPublicProblem)
      )
    })
  })

  describe('getPublicProblems', () => {
    afterEach(() => {
      mockProblemRepository.getPublicProblems.mockClear()
    })

    it('should return public problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getPublicProblems')
        .mockResolvedValueOnce(mockProblems)

      // when
      const result = await problemService.getPublicProblems(paginationDto)

      // then
      expect(result).toEqual(
        plainToInstance(PublicProblemsResponseDto, mockProblems)
      )
    })
  })

  describe('getPublicContestProblem', () => {
    afterEach(() => {
      mockProblemRepository.getContestProblem.mockClear()
    })

    it('should return the public contest problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getContestProblem')
        .mockResolvedValueOnce(mockContestProblem)
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleContest')
        .mockResolvedValueOnce(true)

      // when
      const result = await problemService.getPublicContestProblem(
        contestId,
        problemId
      )

      // then
      expect(result).toEqual(
        plainToInstance(PublicContestProblemResponseDto, mockContestProblem)
      )
    })

    it('should throw error when the contest is not public or visible', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleContest')
        .mockResolvedValueOnce(false)

      // when
      const callGetPublicContestProblem = async () =>
        await problemService.getPublicContestProblem(contestId, problemId)

      // then
      await expect(callGetPublicContestProblem).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getPublicContestProblems', () => {
    afterEach(() => {
      mockProblemRepository.getContestProblems.mockClear()
    })

    it('should return public contest problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getContestProblems')
        .mockResolvedValueOnce(mockContestProblems)
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleContest')
        .mockResolvedValueOnce(true)

      // when
      const result = await problemService.getPublicContestProblems(
        contestId,
        paginationDto
      )

      // then
      expect(result).toEqual(
        plainToInstance(PublicContestProblemsResponseDto, mockContestProblems)
      )
    })

    it('should throw error when the contest is not public or visible', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleContest')
        .mockResolvedValueOnce(false)

      // when
      const callGetPublicContestProblems = async () =>
        await problemService.getPublicContestProblems(contestId, paginationDto)

      // then
      await expect(callGetPublicContestProblems).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getPublicWorkbookProblem', () => {
    afterEach(() => {
      mockProblemRepository.getWorkbookProblem.mockClear()
    })

    it('should return the public workbook problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getWorkbookProblem')
        .mockResolvedValueOnce(mockWorkbookProblem)
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleWorkbook')
        .mockResolvedValueOnce(true)

      // when
      const result = await problemService.getPublicWorkbookProblem(
        workbookId,
        problemId
      )

      // then
      expect(result).toEqual(
        plainToInstance(PublicWorkbookProblemResponseDto, mockWorkbookProblem)
      )
    })

    it('should throw error when the workbook is not public or visible', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleWorkbook')
        .mockResolvedValueOnce(false)

      // when
      const callGetPublicWorkbookProblem = async () =>
        await problemService.getPublicWorkbookProblem(workbookId, problemId)

      // then
      await expect(callGetPublicWorkbookProblem).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getPublicWorkbookProblms', () => {
    afterEach(() => {
      mockProblemRepository.getWorkbookProblems.mockClear()
    })

    it('should return public workbook problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getWorkbookProblems')
        .mockResolvedValueOnce(mockWorkbookProblems)
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleWorkbook')
        .mockResolvedValueOnce(true)

      // when
      const result = await problemService.getPublicWorkbookProblems(
        workbookId,
        paginationDto
      )

      // then
      expect(result).toEqual(
        plainToInstance(PublicWorkbookProblemsResponseDto, mockWorkbookProblems)
      )
    })

    it('should throw error when the workbook is not public or visible', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isPublicAndVisibleWorkbook')
        .mockResolvedValueOnce(false)

      // when
      const callGetPublicWorkbookProblems = async () =>
        await problemService.getPublicWorkbookProblems(
          workbookId,
          paginationDto
        )

      // then
      await expect(callGetPublicWorkbookProblems).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getGroupContestProblem', () => {
    it('should return group contest problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getContestProblem')
        .mockResolvedValueOnce(mockContestProblem)
      jest
        .spyOn(problemService as any, 'isVisibleContestOfGroup')
        .mockResolvedValue(true)

      // when
      const result = await problemService.getGroupContestProblem(
        groupId,
        contestId,
        problemId
      )

      // then
      expect(result).toEqual(
        plainToInstance(ContestProblemResponseDto, mockContestProblem)
      )
    })

    it('should throw error when the contest is not visible or belongs to the group', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isVisibleContestOfGroup')
        .mockResolvedValueOnce(false)

      // when
      const callGetGroupContestProblem = async () =>
        await problemService.getGroupContestProblem(
          groupId,
          contestId,
          problemId
        )

      // then
      await expect(callGetGroupContestProblem).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getGroupContestProblems', () => {
    it('should return group contest problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getContestProblems')
        .mockResolvedValueOnce(mockContestProblems)
      jest
        .spyOn(problemService as any, 'isVisibleContestOfGroup')
        .mockResolvedValue(true)

      // when
      const result = await problemService.getGroupContestProblems(
        groupId,
        contestId,
        paginationDto
      )

      // then
      expect(result).toEqual(
        plainToInstance(ContestProblemsResponseDto, mockContestProblems)
      )
    })

    it('should throw error when the contest is not visible or belongs to the group', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isVisibleContestOfGroup')
        .mockResolvedValueOnce(false)

      // when
      const callGetGroupContestProblems = async () =>
        await problemService.getGroupContestProblems(
          groupId,
          contestId,
          paginationDto
        )

      // then
      await expect(callGetGroupContestProblems).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getGroupWorkbookProblem', () => {
    it('should return group workbook problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getWorkbookProblem')
        .mockResolvedValueOnce(mockWorkbookProblem)
      jest
        .spyOn(problemService as any, 'isVisibleWorkbookOfGroup')
        .mockResolvedValue(true)

      // when
      const result = await problemService.getGroupWorkbookProblem(
        groupId,
        workbookId,
        problemId
      )

      // then
      expect(result).toEqual(
        plainToInstance(WorkbookProblemResponseDto, mockWorkbookProblem)
      )
    })

    it('should throw error when the workbook is not visible or belongs to the group', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isVisibleWorkbookOfGroup')
        .mockResolvedValueOnce(false)

      // when
      const callGetGroupWorkbookProblem = async () =>
        await problemService.getGroupWorkbookProblem(
          groupId,
          workbookId,
          problemId
        )

      // then
      await expect(callGetGroupWorkbookProblem).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getGroupWorkbookProblems', () => {
    it('should return group workbook problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getWorkbookProblems')
        .mockResolvedValueOnce(mockWorkbookProblems)
      jest
        .spyOn(problemService as any, 'isVisibleWorkbookOfGroup')
        .mockResolvedValue(true)

      // when
      const result = await problemService.getGroupWorkbookProblems(
        groupId,
        workbookId,
        paginationDto
      )

      // then
      expect(result).toEqual(
        plainToInstance(WorkbookProblemsResponseDto, mockWorkbookProblems)
      )
    })

    it('should throw error when the workbook is not visible or belongs to the group', async () => {
      // given
      jest
        .spyOn(problemService as any, 'isVisibleWorkbookOfGroup')
        .mockResolvedValueOnce(false)

      // when
      const callGetGroupWorkbookProblems = async () =>
        await problemService.getGroupWorkbookProblems(
          groupId,
          workbookId,
          paginationDto
        )

      // then
      await expect(callGetGroupWorkbookProblems).rejects.toThrow(
        EntityNotExistException
      )
    })
    // expect(service).to.be.ok
  })
})
