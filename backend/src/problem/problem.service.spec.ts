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
import { Problems } from './mock/problem.mock'
import { ProblemRepository } from './problem.repository'
import { ProblemService } from './problem.service'

const ARBITRARY_VAL = 1
const groupId = ARBITRARY_VAL
const contestId = ARBITRARY_VAL
const workbookId = ARBITRARY_VAL
const problemId = ARBITRARY_VAL

const problems = Problems.map((problem) => {
  return Object.assign({}, problem)
})
const publicProblem = Object.assign({}, problems[0])

const contestProblem = Object.assign({}, problems[0])
contestProblem['ContestProblem'] = [{ display_id: 'A' }]

const contestProblems = Problems.map((problem) => {
  const contestProblem = Object.assign({}, problem)
  contestProblem['ContestProblem'] = [{ display_id: 'A' }]
  return contestProblem
})

const workbookProblem = Object.assign({}, problems[0])
workbookProblem['WorkbookProblem'] = [{ display_id: 'A' }]

const workbookProblems = Problems.map((problem) => {
  const workbookProblem = Object.assign({}, problem)
  workbookProblem['WorkbookProblem'] = [{ display_id: 'A' }]
  return workbookProblem
})

const paginationDto = new PaginationDto()
paginationDto.offset = 0
paginationDto.limit = 10

const mockProblemRepository = {
  getPublicProblem: jest.fn().mockResolvedValue(undefined),
  getProblemOfContest: jest.fn().mockResolvedValue(undefined),
  getProblemOfWorkbook: jest.fn().mockResolvedValue(undefined),
  getPublicProblems: jest.fn().mockResolvedValue(undefined),
  getProblemsOfContest: jest.fn().mockResolvedValue(undefined),
  getProblemsOfWorkbook: jest.fn().mockResolvedValue(undefined)
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
        .mockResolvedValueOnce(publicProblem)

      // when
      const result = await problemService.getPublicProblem(problemId)

      // then
      expect(result).toEqual(
        plainToInstance(PublicProblemResponseDto, publicProblem)
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
        .mockResolvedValueOnce(problems)

      // when
      const result = await problemService.getPublicProblems(paginationDto)

      // then
      expect(result).toEqual(
        plainToInstance(PublicProblemsResponseDto, problems)
      )
    })
  })

  describe('getPublicContestProblem', () => {
    afterEach(() => {
      mockProblemRepository.getProblemOfContest.mockClear()
    })

    it('should return the public contest problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getProblemOfContest')
        .mockResolvedValueOnce(contestProblem)
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
        plainToInstance(PublicContestProblemResponseDto, contestProblem)
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
      mockProblemRepository.getProblemsOfContest.mockClear()
    })

    it('should return public contest problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getProblemsOfContest')
        .mockResolvedValueOnce(contestProblems)
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
        plainToInstance(PublicContestProblemsResponseDto, contestProblems)
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
      mockProblemRepository.getProblemOfWorkbook.mockClear()
    })

    it('should return the public workbook problem', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getProblemOfWorkbook')
        .mockResolvedValueOnce(workbookProblem)
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
        plainToInstance(PublicWorkbookProblemResponseDto, workbookProblem)
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
      mockProblemRepository.getProblemsOfWorkbook.mockClear()
    })

    it('should return public workbook problems', async () => {
      // given
      jest
        .spyOn(problemRepository, 'getProblemsOfWorkbook')
        .mockResolvedValueOnce(workbookProblems)
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
        plainToInstance(PublicWorkbookProblemsResponseDto, workbookProblems)
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
        .spyOn(problemRepository, 'getProblemOfContest')
        .mockResolvedValueOnce(contestProblem)
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
        plainToInstance(ContestProblemResponseDto, contestProblem)
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
        .spyOn(problemRepository, 'getProblemsOfContest')
        .mockResolvedValueOnce(contestProblems)
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
        plainToInstance(ContestProblemsResponseDto, contestProblems)
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
        .spyOn(problemRepository, 'getProblemOfWorkbook')
        .mockResolvedValueOnce(workbookProblem)
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
        plainToInstance(WorkbookProblemResponseDto, workbookProblem)
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
        .spyOn(problemRepository, 'getProblemsOfWorkbook')
        .mockResolvedValueOnce(workbookProblems)
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
        plainToInstance(WorkbookProblemsResponseDto, workbookProblems)
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
  })
})
