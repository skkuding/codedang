import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Contest } from '@admin/@generated/contest/contest.model'
import { ContestService } from './contest.service'
import type {
  CreateContestInput,
  UpdateContestInput
} from './model/contest.input'
import type { PublicizingRequest } from './model/publicizing-request.model'

const contestId = 1
const userId = 1
const groupId = 1

const contest: Contest = {
  id: contestId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  config: {
    isVisible: true,
    isRankVisible: true
  },
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const publicizingRequest: PublicizingRequest = {
  contestId,
  userId,
  expireTime: new Date('2050-08-19T07:32:07.533Z')
}

const input = {
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  config: {
    isVisible: false,
    isRankVisible: false
  }
} satisfies CreateContestInput

const updateInput = {
  id: 1,
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  config: {
    isVisible: false,
    isRankVisible: false
  }
} satisfies UpdateContestInput

const db = {
  contest: {
    findFirst: stub().resolves(Contest),
    findUnique: stub().resolves(Contest),
    findMany: stub().resolves([Contest]),
    create: stub().resolves(Contest),
    update: stub().resolves(Contest),
    delete: stub().resolves(Contest)
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ContestService', () => {
  let service: ContestService
  let cache: Cache

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
    cache = module.get<Cache>(CACHE_MANAGER)
    stub(cache.store, 'keys').resolves(['contest:1:publicize'])
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

  describe('getPublicizingRequests', () => {
    it('should return an array of PublicizingRequest', async () => {
      const cacheSpyGet = stub(cache, 'get').resolves([publicizingRequest])
      const res = await service.getPublicizingRequests()

      expect(cacheSpyGet.called).to.be.true
      expect(res).to.deep.equal([publicizingRequest])
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

  describe('handlePublicizingRequest', () => {
    it('should return accepted state', async () => {
      db.contest.update.resolves(contest)

      const cacheSpyGet = stub(cache, 'get').resolves([publicizingRequest])
      const res = await service.handlePublicizingRequest(contestId, true)

      expect(cacheSpyGet.called).to.be.true
      expect(res).to.deep.equal({
        contestId,
        isAccepted: true
      })
    })

    it('should throw error when groupId or contestId not exist', async () => {
      expect(service.handlePublicizingRequest(1000, true)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when the contest is not requested to public', async () => {
      expect(service.handlePublicizingRequest(3, true)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })
})
