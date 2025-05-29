import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  exampleOrderUpdatedWorkbookProblems,
  exampleWorkbook,
  exampleWorkbookProblems
} from '@admin/problem/mock/mock'
import { WorkbookProblemService } from './workbook-problem.service'

const db = {
  workbook: {
    findFirstOrThrow: stub()
  },
  workbookProblem: {
    findFirstOrThrow: stub(),
    findMany: stub(),
    update: stub()
  },
  $transaction: stub()
}

describe('WorkbookProblemService', () => {
  let service: WorkbookProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbookProblemService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<WorkbookProblemService>(WorkbookProblemService)
  })

  describe('getWorkbookProblems', () => {
    it('should return workbookProblems', async () => {
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbookProblems[0])
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      //when
      const result = await service.getWorkbookProblems(1, 1)
      //then
      expect(result).to.deep.equals(exampleWorkbookProblems)
    })

    it('should handle NotExistError', async () => {
      //given
      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      // when & then
      await expect(service.getWorkbookProblems(1, -1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('updateWorkbookProblemsOrder', () => {
    beforeEach(() => {
      // stub의 동작 초기화
      db.workbookProblem.update.resetBehavior()
      db.workbookProblem.findFirstOrThrow.resetBehavior()
      db.workbookProblem.findMany.resetBehavior()
    })
    it('should return order-updated workbookProblems', async () => {
      //given
      const groupId = 1
      const workbookId = 1
      const orders = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      const exampleWorkbookProblemsToBeUpdated =
        exampleWorkbookProblems.toSorted((a, b) => a.problemId - b.problemId)
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)

      // update가 Promise.all로 실행되기 때문에 각 쿼리에 대한 모의 응답을 반환하도록 설정
      for (let i = 0; i < 10; i++) {
        const record = exampleWorkbookProblemsToBeUpdated[i]
        const newOrder = orders.indexOf(record.problemId) + 1
        db.workbookProblem.update
          .withArgs({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              workbookId_problemId: {
                workbookId,
                problemId: record.problemId
              }
            },
            data: { order: newOrder }
          })
          .resolves(exampleOrderUpdatedWorkbookProblems[i])
      }
      db.$transaction.resolves(exampleOrderUpdatedWorkbookProblems)
      //when
      const result = await service.updateWorkbookProblemsOrder(
        groupId,
        workbookId,
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      )
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedWorkbookProblems)
    })

    it('should handle NotFound error', async () => {
      //given
      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(
          -1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(1, 1, [2, 3, 4, 5, 6, 7, 8, 9, 10])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      beforeEach(() => {
        // stub의 동작 초기화
        db.workbookProblem.update.resetBehavior()
        db.workbookProblem.findFirstOrThrow.resetBehavior()
        db.workbookProblem.findMany.resetBehavior()
        db.$transaction.resetBehavior()
      })
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      db.workbookProblem.update.rejects(
        new EntityNotExistException('record not found')
      )
      db.$transaction.rejects(new EntityNotExistException('record not found'))
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(
          1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
