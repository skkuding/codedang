import { Test, type TestingModule } from '@nestjs/testing'
import type { ContestProblem } from '@generated'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestProblemService } from './contest-problem.service'

const db = {
  contestProblem: {
    findMany: stub(),
    update: stub()
  }
}

const exampleContestProblems: ContestProblem[] = [
  {
    order: 1,
    contestId: 1,
    problemId: 1,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    contestId: 1,
    problemId: 2,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    contestId: 1,
    problemId: 3,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    contestId: 1,
    problemId: 4,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    contestId: 1,
    problemId: 5,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    contestId: 1,
    problemId: 6,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    contestId: 1,
    problemId: 7,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    contestId: 1,
    problemId: 8,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    contestId: 1,
    problemId: 9,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    contestId: 1,
    problemId: 10,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]

describe('ContestProblemService', () => {
  let service: ContestProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestProblemService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<ContestProblemService>(ContestProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContestProblems', () => {
    it('should return ContestProblems', async () => {
      //given
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when
      const result = await service.getContestProblems(1)
      //then
      expect(result).to.deep.equals(exampleContestProblems)
    })

    it('should handle NotFoundError', async () => {
      //given
      db.contestProblem.findMany.resolves([])
      // when & then
      await expect(service.getContestProblems(-1)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })

  describe('updateContestProblemsOrder', () => {
    it('should return order-updated ContestProblems', async () => {
      //given
      const exampleOrderUpdatedContestProblems: ContestProblem[] = [
        {
          order: 2,
          contestId: 1,
          problemId: 1,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 3,
          contestId: 1,
          problemId: 2,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 4,
          contestId: 1,
          problemId: 3,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 5,
          contestId: 1,
          problemId: 4,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 6,
          contestId: 1,
          problemId: 5,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 7,
          contestId: 1,
          problemId: 6,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 8,
          contestId: 1,
          problemId: 7,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 9,
          contestId: 1,
          problemId: 8,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 10,
          contestId: 1,
          problemId: 9,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 1,
          contestId: 1,
          problemId: 10,
          score: 1,
          createTime: new Date(),
          updateTime: new Date()
        }
      ]

      db.contestProblem.findMany.resolves(exampleContestProblems)
      for (let i = 0; i < 10; i++) {
        db.contestProblem.update
          .onCall(i)
          .resolves(exampleOrderUpdatedContestProblems[i])
      }
      //when
      const result = await service.updateContestProblemsOrder(
        1,
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      )
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedContestProblems)
    })

    it('should handle NotFound error', async () => {
      //given
      db.contestProblem.findMany.resolves([])
      //when & then
      await expect(
        service.updateContestProblemsOrder(-1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when & then
      await expect(
        service.updateContestProblemsOrder(1, [])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      //given
      db.contestProblem.findMany.resolves(exampleContestProblems)
      for (let i = 0; i < 10; i++) {
        db.contestProblem.update.onCall(10 + i).rejects(
          new PrismaClientKnownRequestError('record NotFound', {
            code: 'P2025',
            meta: { target: ['Contestproblem'] },
            clientVersion: '5.1.1'
          })
        )
      }
      //when & then
      await expect(
        service.updateContestProblemsOrder(-1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })
})
