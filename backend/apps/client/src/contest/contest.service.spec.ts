import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Contest, ContestRecord, Group, UserGroup } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import * as dayjs from 'dayjs'
import { stub } from 'sinon'
import { contestPublicizingRequestKey } from '@libs/cache'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from './contest.service'
import type { CreateContestDto } from './dto/create-contest.dto'
import type { UpdateContestDto } from './dto/update-contest.dto'

const contestId = 1
const userId = 1
const groupId = 1
const contestPublicizeRequestId = 1
const undefinedUserId = undefined

const contest = {
  id: contestId,
  createdById: userId,
  groupId: groupId,
  title: 'title',
  description: 'description',
  startTime: dayjs().add(-1, 'day').toDate(),
  endTime: dayjs().add(1, 'day').toDate(),
  config: {
    isVisible: true,
    isRankVisible: true
  },
  createTime: dayjs().add(-1, 'day').toDate(),
  updateTime: dayjs().add(-1, 'day').toDate(),
  group: {
    id: groupId,
    groupName: 'group'
  }
} satisfies Contest & { group: Partial<Group> }

const contestDetail = {
  title: 'contest',
  description: 'description',
  id: contestId,
  group: {
    id: groupId,
    groupName: 'group'
  },
  startTime: dayjs().add(-1, 'day').toDate(),
  endTime: dayjs().add(-1, 'day').toDate()
}

const ongoingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId,
    startTime: dayjs().add(-1, 'day').toDate(),
    endTime: dayjs().add(1, 'day').toDate(),
    config: {
      isVisible: false,
      isRankisVisible: true
    }
  }
]
const finishedContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 1,
    startTime: dayjs().add(-2, 'day').toDate(),
    endTime: dayjs().add(-1, 'day').toDate(),
    config: {
      isVisible: false,
      isRankisVisible: true
    }
  }
]
const upcomingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 6,
    startTime: dayjs().add(1, 'day').toDate(),
    endTime: dayjs().add(2, 'day').toDate(),
    config: {
      isVisible: false,
      isRankisVisible: true
    }
  }
]
const registeredOngoingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId,
    endTime: new Date('2999-12-01T12:00:00.000+09:00'),
    config: {
      isVisible: false,
      isRankisVisible: true
    }
  }
]
const registeredUpcomingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 6,
    startTime: new Date('2999-12-01T12:00:00.000+09:00'),
    endTime: new Date('2999-12-01T15:00:00.000+09:00'),
    config: {
      isVisible: false,
      isRankisVisible: true
    }
  }
]
const contests: Partial<Contest>[] = [
  ...ongoingContests,
  ...finishedContests,
  ...upcomingContests
]
const userContests: Partial<Contest>[] = [
  ...registeredOngoingContests,
  ...registeredUpcomingContests
]
const ongoingContest: Partial<Contest> = ongoingContests[0]

const earlierContest: Contest = {
  ...contest,
  id: contestId,
  startTime: new Date('2999-12-01T11:00:00.000+09:00'),
  endTime: new Date('2999-12-01T15:00:00.000+09:00'),
  config: {
    isVisible: false,
    isRankisVisible: true
  }
}

const laterContest: Contest = {
  ...contest,
  id: contestId,
  startTime: new Date('2999-12-01T12:00:00.000+09:00'),
  endTime: new Date('2999-12-01T15:00:00.000+09:00'),
  config: {
    isVisible: false,
    isRankisVisible: true
  }
}

const user = {
  id: userId,
  contest: userContests
}

const contestPublicizingRequest = {
  contest: contestId,
  user: userId,
  createTime: new Date()
}

const userGroup: UserGroup = {
  userId: userId,
  groupId: groupId,
  isGroupLeader: true,
  createTime: new Date(),
  updateTime: new Date()
}
const userGroups: UserGroup[] = [
  userGroup,
  {
    ...userGroup,
    groupId: userGroup.groupId + 1
  }
]
const record: ContestRecord = {
  id: 1,
  contestId: contestId,
  userId: userId,
  acceptedProblemNum: 0,
  totalPenalty: 0,
  createTime: new Date(),
  updateTime: new Date()
}
const recordAlready: ContestRecord = {
  id: 1,
  contestId: contestId,
  userId: userId,
  acceptedProblemNum: 0,
  totalPenalty: 0,
  createTime: new Date(),
  updateTime: new Date()
}

const recordFinished = {
  groupId: 1,
  startTime: new Date('2021-12-01T14:00:00.000+09:00'),
  endTime: new Date('2021-12-01T15:00:00.000+09:00')
}

const publicContestRecord = {
  groupId: 1,
  startTime: new Date('2021-12-01T14:00:00.000+09:00'),
  endTime: new Date('2021-12-01T15:00:00.000+09:00')
}

const mockPrismaService = {
  contest: {
    findUnique: stub().resolves(contest),
    findFirst: stub().resolves(contest),
    findMany: stub().resolves(contests),
    create: stub().resolves(contest),
    update: stub().resolves(contest),
    delete: stub()
  },
  contestRecord: {
    findFirst: stub().resolves(null),
    create: stub().resolves(null)
  },
  userGroup: {
    findFirst: stub().resolves(userGroup),
    findMany: stub().resolves(userGroups)
  },
  user: {
    findUnique: stub().resolves(user)
  }
}

describe('ContestService', () => {
  let service: ContestService
  let cache: Cache
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        { provide: PrismaService, useValue: mockPrismaService },
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
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createContest', () => {
    const createContestDto: CreateContestDto = {
      groupId: contest.groupId,
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      isVisible: contest.config.isVisible,
      isRankVisible: contest.config.isRankVisible
    }

    afterEach(() => {
      mockPrismaService.contest.create.reset()
    })

    it('should return created contest', async () => {
      //given

      //when
      const result = await service.createContest(createContestDto, userId)

      //then
      expect(mockPrismaService.contest.create.calledOnce).to.be.true
      expect(result).to.deep.equal(contest)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = stub(service, 'isValidPeriod').returns(false)

      //when
      const callContestCreate = async () =>
        await service.createContest(createContestDto, userId)

      //then
      await expect(callContestCreate()).to.be.rejectedWith(
        UnprocessableDataException
      )
      expect(mockPrismaService.contest.create.called).to.be.false

      isValidPeriodSpy.restore()
    })
  })

  describe('updateContest', () => {
    let callUpdateContest
    const updateContestDto: UpdateContestDto = {
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      isVisible: contest.config.isVisible,
      isRankVisible: contest.config.isRankVisible
    }

    beforeEach(() => {
      mockPrismaService.contest.findUnique.resolves(contest)
      callUpdateContest = async () =>
        await service.updateContest(contestId, updateContestDto)
    })

    afterEach(() => {
      mockPrismaService.contest.update.reset()
    })

    it('should return updated contest', async () => {
      //given

      //when
      const result = await service.updateContest(contestId, updateContestDto)

      //then
      expect(mockPrismaService.contest.update.calledOnce).to.be.true
      expect(result).to.equal(contest)
    })

    it('should throw error when the contest does not exist', async () => {
      //given
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      //when

      //then
      await expect(
        service.updateContest(contestId, updateContestDto)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(mockPrismaService.contest.update.called).to.be.false
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = stub(service, 'isValidPeriod').returns(false)

      //when

      //then
      await expect(callUpdateContest()).to.be.rejectedWith(
        UnprocessableDataException
      )
      expect(mockPrismaService.contest.update.called).to.be.false

      isValidPeriodSpy.restore()
    })
  })

  describe('createPublicContestRecord', () => {
    it('should throw error when the contest does not exist', async () => {
      mockPrismaService.contest.findFirst.resolves(null)
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when user is participated in contest again', async () => {
      mockPrismaService.contest.findFirst.resolves(publicContestRecord)
      mockPrismaService.contestRecord.findFirst.resolves(recordAlready)
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when contest is not ongoing', async () => {
      mockPrismaService.contest.findFirst.resolves(publicContestRecord)
      mockPrismaService.contestRecord.findFirst.resolves(recordFinished)
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(ConflictFoundException)
    })
  })

  describe('isValidPeriod', () => {
    const startTime = new Date('2022-12-07T18:34:23.999175+09:00')
    const endTime = new Date('2022-12-07T18:34:23.999175+09:00')

    it('should return true when given valid start time and end time', () => {
      //given
      endTime.setDate(startTime.getDate() + 1)

      //when
      const result = service.isValidPeriod(startTime, endTime)

      //then
      expect(result).to.equal(true)
    })

    it('should return false when end time is ealier than start time', () => {
      //given
      endTime.setDate(startTime.getDate() - 1)

      //when
      const result = service.isValidPeriod(startTime, endTime)

      //then
      expect(result).to.be.false
    })
  })

  describe('deleteContest', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.resolves(contest)
    })
    afterEach(() => {
      mockPrismaService.contest.delete.reset()
    })

    it('should successfully delete the contest', async () => {
      //given

      //when
      await service.deleteContest(contestId)

      //then
      expect(mockPrismaService.contest.delete.calledOnce).to.be.true
    })

    it('should throw error when contest does not exist', async () => {
      //given
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      //when
      const callContestDelete = async () =>
        await service.deleteContest(contestId)

      //then
      await expect(callContestDelete()).to.be.rejectedWith(
        EntityNotExistException
      )
      expect(mockPrismaService.contest.delete.called).to.be.false
    })
  })

  describe('getAliveContests', () => {
    it('should return ongoing, upcoming contests when userId is undefined', async () => {
      mockPrismaService.contest.findMany.resolves(contests)
      expect(
        await service.getContestsByGroupId(undefinedUserId, groupId)
      ).to.deep.equal({
        ongoing: ongoingContests,
        upcoming: upcomingContests
      })
    })

    it('should return registered ongoing, registered upcoming, ongoing, upcoming contests', async () => {
      mockPrismaService.user.findUnique.resolves(user)
      mockPrismaService.contest.findMany.resolves(contests)
      expect(await service.getContestsByGroupId(userId, groupId)).to.deep.equal(
        {
          registeredOngoing: registeredOngoingContests,
          registeredUpcoming: registeredUpcomingContests,
          ongoing: ongoingContests,
          upcoming: upcomingContests
        }
      )
    })
  })

  describe('getFinishedContests', () => {
    it('should return finished contests when cursor is 0', async () => {
      mockPrismaService.contest.findMany.resolves(finishedContests)
      expect(await service.getFinishedContestsByGroupId(0, 1)).to.deep.equal({
        finished: finishedContests
      })
    })
  })

  describe('startTimeCompare', () => {
    it('should return -1 when a is earlier than b', async () => {
      expect(
        service.startTimeCompare(earlierContest, laterContest)
      ).to.deep.equal(-1)
    })

    it('should return 1 when b is earlier than a', async () => {
      expect(
        service.startTimeCompare(laterContest, earlierContest)
      ).to.deep.equal(1)
    })

    it('should return 0 when a.startTime is equal b.startTime', async () => {
      expect(
        service.startTimeCompare(earlierContest, earlierContest)
      ).to.deep.equal(0)
    })
  })

  describe('filterOngoing', () => {
    it('should return ongoing contests of the group', async () => {
      expect(service.filterOngoing(contests)).to.deep.equal(ongoingContests)
    })
  })

  describe('filterUpcoming', () => {
    it('should return upcoming contests of the group', async () => {
      expect(service.filterUpcoming(contests)).to.deep.equal(upcomingContests)
    })
  })

  describe('getContestsByGroupId', () => {
    it('should return ongoing, upcoming, finished contests', async () => {
      mockPrismaService.contest.findMany.resolves(contests)
      expect(
        await service.getContestsByGroupId(undefinedUserId, groupId)
      ).to.deep.equal({
        ongoing: ongoingContests,
        upcoming: upcomingContests
      })
    })

    //TODO: test when userId is given
  })

  describe('getContest', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findFirst.rejects(
        new EntityNotExistException('contest')
      )

      await expect(service.getContest(contestId, groupId)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findFirst.resolves(contestDetail)

      expect(await service.getContest(groupId, contestId)).to.deep.equal(
        contestDetail
      )
    })
  })

  describe('getAdminContests', () => {
    it('should return contests in open space', async () => {
      expect(await service.getAdminContests(0, 3)).to.deep.equal(contests)
    })
  })

  describe('getAdminOngoingContests', () => {
    it('should return ongoing contests in open space', async () => {
      mockPrismaService.contest.findMany.resolves(ongoingContests)

      expect(await service.getAdminOngoingContests(0, 1)).to.deep.equal(
        ongoingContests
      )
    })
  })

  describe('getAdminContest', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      await expect(service.getAdminContest(contestId)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)

      expect(await service.getAdminContest(contestId)).to.deep.equal(contest)
    })
  })

  describe('createContestPublicizingRequest', () => {
    it('should return created request when contest does not have accepted or pending request', async () => {
      stub(cache, 'get').resolves(null)
      const setSpy = stub(cache, 'set').resolves()

      await service.createContestPublicizingRequest(userId, contestId)
      expect(setSpy.calledOnce).to.be.true
    })

    it('should throw error when existing accepted request for the contest', async () => {
      stub(cache, 'get').resolves(contestPublicizingRequest)
      const setSpy = stub(cache, 'set').resolves()

      await expect(
        service.createContestPublicizingRequest(userId, contestId)
      ).to.be.rejectedWith(ConflictFoundException)
      expect(setSpy.called).to.be.false
    })
  })

  describe('getContestPublicizingRequests', () => {
    it('should return requests for given contestId', async () => {
      stub(cache.store, 'keys').resolves([
        contestPublicizingRequestKey(contestId)
      ])
      stub(cache, 'get').resolves(contestPublicizingRequest)

      const res = await service.getContestPublicizingRequests()
      expect(res).to.deep.equal([contestPublicizingRequest])
    })
  })

  describe('respondContestPublicizingRequest', () => {
    afterEach(() => {
      mockPrismaService.contest.update.reset()
    })

    it('should update contest and request', async () => {
      stub(cache, 'get').resolves(contestPublicizingRequest)
      const delSpy = stub(cache, 'del').resolves()

      await service.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        { accepted: true }
      )
      expect(mockPrismaService.contest.update.calledOnce).to.be.true
      expect(delSpy.calledOnce).to.be.true
    })

    it('should throw error when request for the contest does not exist', async () => {
      stub(cache, 'get').resolves(null)
      const delSpy = stub(cache, 'del').resolves()

      await expect(
        service.respondContestPublicizingRequest(contestPublicizeRequestId, {
          accepted: true
        })
      ).to.be.rejectedWith(EntityNotExistException)
      expect(delSpy.called).to.be.false
    })

    it('should not update contest when given request is rejected', async () => {
      stub(cache, 'get').resolves(contestPublicizingRequest)
      const delSpy = stub(cache, 'del').resolves()

      await service.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        { accepted: false }
      )
      expect(mockPrismaService.contest.update.calledOnce).to.be.false
      expect(delSpy.calledOnce).to.be.true
    })
  })

  describe('createContestRecord', () => {
    beforeEach(() => {
      mockPrismaService.contest.findFirst.resolves(ongoingContest)
      mockPrismaService.contestRecord.findFirst.resolves(null)
    })
    afterEach(() => {
      mockPrismaService.contest.findFirst.resolves(contest)
      mockPrismaService.contestRecord.findFirst.resolves(null)
    })

    it('should throw error when the contest does not exist', async () => {
      mockPrismaService.contest.findFirst.resolves(null)
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when user is participated in contest again', async () => {
      mockPrismaService.contestRecord.findFirst.resolves(record)
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(ConflictFoundException)
    })
    it('should throw error when contest is not ongoing', async () => {
      mockPrismaService.contest.findFirst.resolves(finishedContests[0])
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(ConflictFoundException)
    })
    it('should successfully create contestRankACM', async () => {
      mockPrismaService.contestRecord.create.reset()
      await service.createContestRecord(contestId, userId)
      expect(mockPrismaService.contestRecord.create.calledOnce).to.be.true
    })
  })
})
