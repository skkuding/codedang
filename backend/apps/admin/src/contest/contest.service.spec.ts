import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'

const contestId = 1
const userId = 1
const groupId = 1

const contest: Contest = {
  id: contestId,
  createdById: userId,
  groupId: groupId,
  title: 'title',
  description: 'description',
  startTime: undefined,
  endTime: undefined,
  config: {
    isVisible: true,
    isRankVisible: true
  },
  createTime: undefined,
  updateTime: undefined
}

const input = {
  title: 'test title10',
  description: 'test description',
  startTime: undefined,
  endTime: undefined,
  config: {
    isVisible: false,
    isRankVisible: false
  }
}

const updateInput = {
  id: 1,
  title: 'test title10',
  description: 'test description',
  startTime: undefined,
  endTime: undefined,
  config: {
    isVisible: false,
    isRankVisible: false
  }
}

const db = {
  contest: {
    findFirst: stub().resolves(Contest),
    findUnique: stub().resolves(Contest),
    findMany: stub().resolves([Contest]),
    create: stub().resolves(Contest),
    update: stub().resolves(Contest),
    delete: stub().resolves(Contest)
  }
}

describe('ContestService', () => {
  let service: ContestService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
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

    service = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContests', () => {
    it('should return an array of contests', async () => {
      db.contest.findMany.resolves([contest])

      const res = await service.getContests(5, 2, 0)
      expect(res).to.deep.equal([contest])
    })
  })

  describe('getPublicRequests', () => {
    it('should return an array of PublicizingRequest', async () => {
      const res = await service.getPublicRequests()
      expect(res).to.deep.equal([])
    })
  })

  describe('createContest', () => {
    it('should return created contest', async () => {
      db.contest.create.resolves(contest)

      const res = await service.createContest(groupId, userId, input)
      expect(res).to.deep.equal(contest)
    })
  })

  describe('updateContest', () => {
    it('should return updated contest', async () => {
      db.contest.update.resolves(contest)

      const res = await service.updateContest(groupId, updateInput)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.updateContest(1000, updateInput)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('deleteContest', () => {
    it('should return deleted contest', async () => {
      db.contest.findFirst.resolves(contest)

      const res = await service.deleteContest(groupId, contestId)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.deleteContest(1000, 1000)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('acceptPublicizingRequest', () => {
    it('should return accepted contest', async () => {
      db.contest.update.resolves(contest)

      const res = await service.acceptPublicizingRequest(groupId, contestId)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.acceptPublicizingRequest(1000, 1000)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when the contest is not requested to public', async () => {
      expect(service.acceptPublicizingRequest(2, 3)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('rejectPublic', () => {
    it('should return rejected contest', async () => {
      db.contest.findUnique.resolves(contest)

      const res = await service.rejectPublicizingRequest(groupId, contestId)
      expect(res).to.deep.equal(contest)
    })

    it('should throw error when the contest is not requested to public', async () => {
      expect(service.rejectPublicizingRequest(2, 3)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.rejectPublicizingRequest(1000, 1000)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })
})
