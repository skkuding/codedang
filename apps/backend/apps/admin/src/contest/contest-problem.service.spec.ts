import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  exampleContest,
  exampleContestProblems,
  exampleOrderUpdatedContestProblems
} from '@admin/problem/mock/mock'
import { ContestProblemService } from './contest-problem.service'

const db = {
  contest: {
    findFirstOrThrow: stub()
  },
  contestProblem: {
    findFirstOrThrow: stub(),
    findMany: stub(),
    update: stub()
  },
  $transaction: stub()
}

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

  describe('getContestProblems', () => {
    it('should return ContestProblems', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when
      const result = await service.getContestProblems(1)
      //then
      expect(result).to.deep.equals(exampleContestProblems)
    })

    it('should handle NotFoundError', async () => {
      //given

      db.contest.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      // when & then
      await expect(service.getContestProblems(-1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('updateContestProblemsOrder', () => {
    beforeEach(() => {
      // 각 스텁의 동작 초기화
      db.contestProblem.update.resetBehavior()
      db.contestProblem.findFirstOrThrow.resetBehavior()
      db.contestProblem.findMany.resetBehavior()
      db.contest.findFirstOrThrow.resetBehavior()
    })
    it('should return order-updated ContestProblems', async () => {
      //given
      const contestId = 1
      const orders = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      const exampleContestProblemsToBeUpdated = exampleContestProblems.toSorted(
        (a, b) => a.problemId - b.problemId
      )
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)

      // update가 Promise.all로 실행되기 때문에 각 쿼리에 대한 모의 응답을 반환하도록 설정
      for (let i = 0; i < 10; i++) {
        const record = exampleContestProblemsToBeUpdated[i]
        const newOrder = orders.indexOf(record.problemId) + 1
        db.contestProblem.update
          .withArgs({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              contestId_problemId: {
                contestId,
                problemId: record.problemId
              }
            },
            data: { order: newOrder }
          })
          .resolves(exampleOrderUpdatedContestProblems[i])
      }
      db.$transaction.resolves(exampleOrderUpdatedContestProblems)
      //when
      const result = await service.updateContestProblemsOrder(contestId, orders)
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedContestProblems)
    })

    it('should Error when orders length is not same with problems length', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when & then
      await expect(
        service.updateContestProblemsOrder(1, [2, 3, 4, 5, 6, 7, 8, 9, 10])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should Error when orders dont have full imported problems', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when & then
      await expect(
        service.updateContestProblemsOrder(1, [2, 2, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle NotFound error', async () => {
      //given
      db.contest.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      //when & then
      await expect(
        service.updateContestProblemsOrder(-1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when & then
      await expect(
        service.updateContestProblemsOrder(1, [2, 3, 4, 5, 6, 7, 8, 9, 10])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      //given
      db.contestProblem.findMany.resolves(exampleContestProblems)

      db.contestProblem.update.rejects(
        new EntityNotExistException('record not found')
      )
      db.$transaction.rejects(new EntityNotExistException('record not found'))
      //when & then
      await expect(
        service.updateContestProblemsOrder(1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 1])
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
