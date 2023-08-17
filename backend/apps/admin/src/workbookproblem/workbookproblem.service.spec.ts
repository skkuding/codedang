import { Test, type TestingModule } from '@nestjs/testing'
import type { WorkbookProblem } from '@generated'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { WorkbookproblemService } from './workbookproblem.service'

const db = {
  workbookProblem: {
    findMany: stub(),
    update: stub()
  }
}

const exampleWorkbookProblems: WorkbookProblem[] = [
  {
    order: 1,
    workbookId: 1,
    problemId: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 2,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    workbookId: 1,
    problemId: 3,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    workbookId: 1,
    problemId: 4,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    workbookId: 1,
    problemId: 5,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    workbookId: 1,
    problemId: 6,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    workbookId: 1,
    problemId: 7,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    workbookId: 1,
    problemId: 8,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    workbookId: 1,
    problemId: 9,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    workbookId: 1,
    problemId: 10,
    createTime: new Date(),
    updateTime: new Date()
  }
]

describe('WorkbookproblemService', () => {
  let service: WorkbookproblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbookproblemService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<WorkbookproblemService>(WorkbookproblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getWorkbookProblems', () => {
    it('should return workbookProblems', async () => {
      //given
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      //when
      const result = await service.getWorkbookProblems(1)
      //then
      expect(result).to.deep.equals(exampleWorkbookProblems)
    })

    it('should handle NotFoundError', async () => {
      //given
      db.workbookProblem.findMany.resolves([])
      // when & then
      await expect(service.getWorkbookProblems(-1)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })

  describe('updateWorkbookProblemsOrder', () => {
    it('should return order-updated workbookProblems', async () => {
      //given
      const exampleOrderUpdatedWorkbookProblems: WorkbookProblem[] = [
        {
          order: 2,
          workbookId: 1,
          problemId: 1,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 3,
          workbookId: 1,
          problemId: 2,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 4,
          workbookId: 1,
          problemId: 3,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 5,
          workbookId: 1,
          problemId: 4,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 6,
          workbookId: 1,
          problemId: 5,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 7,
          workbookId: 1,
          problemId: 6,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 8,
          workbookId: 1,
          problemId: 7,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 9,
          workbookId: 1,
          problemId: 8,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 10,
          workbookId: 1,
          problemId: 9,
          createTime: new Date(),
          updateTime: new Date()
        },
        {
          order: 1,
          workbookId: 1,
          problemId: 10,
          createTime: new Date(),
          updateTime: new Date()
        }
      ]

      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      for (let i = 0; i < 10; i++) {
        db.workbookProblem.update
          .onCall(i)
          .resolves(exampleOrderUpdatedWorkbookProblems[i])
      }
      //when
      const result = await service.updateWorkbookProblemsOrder(
        1,
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      )
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedWorkbookProblems)
    })

    it('should handle NotFound error', async () => {
      //given
      db.workbookProblem.findMany.resolves([])
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(-1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(1, [])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      //given
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      for (let i = 0; i < 10; i++) {
        db.workbookProblem.update.onCall(10 + i).rejects(
          new PrismaClientKnownRequestError('record NotFound', {
            code: 'P2025',
            meta: { target: ['workbookproblem'] },
            clientVersion: '5.1.1'
          })
        )
      }
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(-1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })
})
