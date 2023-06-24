import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { ClarificationService } from './clarification.service'
import { PrismaService } from '@libs/prisma'
import { ContestService } from '@client/contest/contest.service'
import { type Clarification } from '@prisma/client'
import { EntityNotExistException } from '@client/common/exception/business.exception'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

const groupId = 2
const contestId = 1
const problemId = 1

const clarification: Clarification = {
  id: 1,
  contestId,
  problemId,
  content: '이 문제에 대한 수정 사항',
  createTime: new Date(),
  updateTime: new Date()
}

const db = {
  clarification: {
    findMany: stub()
  },
  contest: {
    count: stub()
  }
}

describe('ClarificationService', () => {
  let service: ClarificationService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClarificationService,
        ContestService,
        { provide: PrismaService, useValue: db },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({})
        }
      ]
    }).compile()

    service = module.get<ClarificationService>(ClarificationService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getClarificationsByContest', () => {
    const array = [
      clarification,
      { ...clarification, id: 2, problemId: 2 },
      { ...clarification, id: 3, problemId: 3 }
    ]
    beforeEach(() => {
      db.clarification.findMany.resolves(array)
    })

    it('should return clarifications related to given contest', async () => {
      db.contest.count.resolves(1)
      const getResult = await service.getClarificationsByContest(
        contestId,
        groupId
      )
      expect(getResult).to.deep.equal(array)
    })

    it('should throw error when given contest does not exist', async () => {
      db.contest.count.resolves(0)
      await expect(
        service.getClarificationsByContest(contestId, groupId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getClarificationsByProblem', () => {
    beforeEach(() => {
      db.clarification.findMany.resolves([clarification])
    })

    it('should return clarifications related to given contestProblem', async () => {
      db.contest.count.resolves(1)
      const getResult = await service.getClarificationsByProblem(
        contestId,
        problemId,
        groupId
      )
      expect(getResult).to.deep.equal([clarification])
    })

    it('should throw error when given contest does not exist', async () => {
      db.contest.count.resolves(0)
      await expect(
        service.getClarificationsByProblem(contestId, problemId, groupId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
