import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  exampleAssignment,
  exampleAssignmentProblems,
  exampleOrderUpdatedAssignmentProblems
} from '@admin/problem/mock/mock'
import { AssignmentProblemService } from './assignment-problem.service'

const db = {
  assignment: {
    findFirstOrThrow: stub()
  },
  assignmentProblem: {
    findFirstOrThrow: stub(),
    findMany: stub(),
    update: stub()
  },
  $transaction: stub()
}

describe('AssignmentProblemService', () => {
  let service: AssignmentProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentProblemService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<AssignmentProblemService>(AssignmentProblemService)
  })

  describe('getAssignmentProblems', () => {
    it('should return AssignmentProblems', async () => {
      //given
      db.assignment.findFirstOrThrow.resolves(exampleAssignment)
      db.assignmentProblem.findMany.resolves(exampleAssignmentProblems)
      //when
      const result = await service.getAssignmentProblems(1, 1)
      //then
      expect(result).to.deep.equals(exampleAssignmentProblems)
    })

    it('should handle NotFoundError', async () => {
      //given

      db.assignment.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      // when & then
      await expect(service.getAssignmentProblems(-1, 1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('updateAssignmentProblemsOrder', () => {
    beforeEach(() => {
      // 각 스텁의 동작 초기화
      db.assignmentProblem.update.resetBehavior()
      db.assignmentProblem.findFirstOrThrow.resetBehavior()
      db.assignmentProblem.findMany.resetBehavior()
      db.assignment.findFirstOrThrow.resetBehavior()
    })
    it('should return order-updated AssignmentProblems', async () => {
      //given
      const groupId = 1
      const assignmentId = 1
      const orders = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      const exampleAssignmentProblemsToBeUpdated =
        exampleAssignmentProblems.toSorted((a, b) => a.problemId - b.problemId)
      db.assignment.findFirstOrThrow.resolves(exampleAssignment)
      db.assignmentProblem.findMany.resolves(exampleAssignmentProblems)

      // update가 Promise.all로 실행되기 때문에 각 쿼리에 대한 모의 응답을 반환하도록 설정
      for (let i = 0; i < 10; i++) {
        const record = exampleAssignmentProblemsToBeUpdated[i]
        const newOrder = orders.indexOf(record.problemId) + 1
        db.assignmentProblem.update
          .withArgs({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              assignmentId_problemId: {
                assignmentId,
                problemId: record.problemId
              }
            },
            data: { order: newOrder }
          })
          .resolves(exampleOrderUpdatedAssignmentProblems[i])
      }
      db.$transaction.resolves(exampleOrderUpdatedAssignmentProblems)
      //when
      const result = await service.updateAssignmentProblemsOrder(
        groupId,
        assignmentId,
        orders
      )
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedAssignmentProblems)
    })

    it('should handle NotFound error', async () => {
      //given
      db.assignment.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      //when & then
      await expect(
        service.updateAssignmentProblemsOrder(
          -1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.assignment.findFirstOrThrow.resolves(exampleAssignment)
      db.assignmentProblem.findMany.resolves(exampleAssignmentProblems)
      //when & then
      await expect(
        service.updateAssignmentProblemsOrder(
          1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10]
        )
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      beforeEach(() => {
        // stub의 동작 초기화
        db.assignmentProblem.update.resetBehavior()
        db.assignmentProblem.findFirstOrThrow.resetBehavior()
        db.assignmentProblem.findMany.resetBehavior()
        db.$transaction.resetBehavior()
      })
      //given
      db.assignmentProblem.findMany.resolves(exampleAssignmentProblems)

      db.assignmentProblem.update.rejects(
        new EntityNotExistException('record not found')
      )
      db.$transaction.rejects(new EntityNotExistException('record not found'))
      //when & then
      await expect(
        service.updateAssignmentProblemsOrder(
          1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
