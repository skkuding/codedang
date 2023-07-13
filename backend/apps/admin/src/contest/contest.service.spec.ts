import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { CacheConfigService } from '@libs/cache'
import { PrismaService } from '@libs/prisma'
import { ContestService } from './contest.service'

// const userId = 1
// const groupId = 2
// const contestId = 1
// const take = 3
// const cursor = 0

// const input = {
//   title: 'title',
//   description: 'description',
//   startTime: undefined,
//   endTime: undefined,
//   config: {
//     isVisible: false,
//     isRankVisible: false
//   }
// }

// const updateInput = {
//   id: 1,
//   ...input
// }

// const contest: Contest = {
//   id: 1,
//   createdById: 1,
//   groupId: 1,
//   updateTime: undefined,
//   createTime: undefined,
//   ...input
// }

// const publicizingRequest: PublicizingRequest = {
//   contest: 1,
//   user: 1,
//   createTime: undefined
// }

// const db = {
//   contest: {
//     findFirst: stub(),
//     findUnique: stub(),
//     findMany: stub().resolves([Contest]),
//     create: stub().resolves(Contest),
//     update: stub(),
//     delete: stub()
//   }
// }

describe('ContestService', () => {
  let service: ContestService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.registerAsync({
          isGlobal: true,
          useClass: CacheConfigService
        })
      ],
      providers: [ContestService, { provide: PrismaService, useValue: {} }]
    }).compile()

    service = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  // describe('getContests', () => {
  //   it('should return an array of contests', async () => {
  //     const res = await service.getContests(5, 2, 0)
  //     expect(res).to.deep.equal([contest])
  //   })
  // })

  // describe('getPublicRequests', () => {
  //   it('should return an array of PublicizingRequest', async () => {
  //     const res = await service.getPublicRequests()
  //     expect(res).to.deep.equal([publicizingRequest])
  //   })
  // })

  // describe('createContest', () => {
  //   it('should return created contest', async () => {
  //     const res = await service.createContest(groupId, userId, input)
  //     expect(res).to.deep.equal(contest)
  //   })
  // })

  // describe('updateContest', () => {
  //   it('should return updated contest', async () => {
  //     const res = await service.updateContest(groupId, updateInput)
  //     expect(res).to.deep.equal(contest)
  //   })
  // })

  // describe('deleteContest', () => {
  //   it('should return deleted contest', async () => {
  //     const res = await service.deleteContest(groupId, contestId)
  //     expect(res).to.deep.equal(contest)
  //   })
  // })

  // describe('acceptPublic', () => {
  //   it('should return accepted contest', async () => {
  //     const res = await service.acceptPublic(groupId, contestId)
  //     expect(res).to.deep.equal(contest)
  //   })
  // })

  // describe('rejectPublic', () => {
  //   it('should return rejected contest', async () => {
  //     const res = await service.rejectPublic(groupId, contestId)
  //     expect(res).to.deep.equal(contest)
  //   })
  // })

  // describe('requestToPublic', () => {
  //   it('should return requested contest', async () => {
  //     const res = await service.requestToPublic(groupId, contestId)
  //     expect(res).to.deep.equal(contest)
  //   })
  // })
})
