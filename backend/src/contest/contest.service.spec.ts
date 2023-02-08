import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub, spy } from 'sinon'
import { Contest, ContestRecord, UserGroup } from '@prisma/client'
import {
  ActionNotAllowedException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import { UpdateContestDto } from './dto/update-contest.dto'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/common'
import { contestPublicizingRequestKey } from 'src/common/cache/keys'

const contestId = 1
const userId = 1
const groupId = 1
const contestPublicizeRequestId = 1

const contest = {
  id: contestId,
  createdById: userId,
  groupId: groupId,
  title: 'title',
  description: 'description',
  startTime: new Date('2021-12-01T14:00:00.000+09:00'),
  endTime: new Date('2021-12-01T15:00:00.000+09:00'),
  config: {
    isVisible: true,
    isRankVisible: true
  },
  createTime: new Date('2021-11-01T18:34:23.999175+09:00'),
  updateTime: new Date('2021-11-01T18:34:23.999175+09:00')
} satisfies Contest

const ongoingContests: Partial<Contest>[] = [
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
const finishedContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 1,
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
const ongoingContest: Partial<Contest> = ongoingContests[0]

const contestPublicizingRequest = {
  contest: contestId,
  user: userId,
  createTime: new Date()
}

const userGroup: UserGroup = {
  id: 1,
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
    id: userGroup.id + 1,
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

const mockPrismaService = {
  contest: {
    findUnique: stub().resolves(contest),
    findMany: stub().resolves(contests),
    create: stub().resolves(contest),
    update: stub().resolves(contest),
    delete: stub()
  },
  contestRecord: {
    findFirst: stub().resolves(null)
  },
  userGroup: {
    findFirst: stub().resolves(userGroup),
    findMany: stub().resolves(userGroups)
  }
}

describe('service', () => {
  let service: ContestService
  let groupService: GroupService
  let cache: Cache
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        GroupService,
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
    groupService = module.get<GroupService>(GroupService)
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
      const result = await service.createContest(userId, createContestDto)

      //then
      expect(mockPrismaService.contest.create.calledOnce).to.be.true
      expect(result).to.deep.equal(contest)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = stub(service, 'isValidPeriod').returns(false)

      //when
      const callContestCreate = async () =>
        await service.createContest(userId, createContestDto)

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

  describe('filterFinished', () => {
    it('should return ongoing contests of the group', async () => {
      expect(service.filterFinished(contests)).to.deep.equal(finishedContests)
    })
  })

  describe('getContests', () => {
    it('should return ongoing, upcoming, finished contests', async () => {
      expect(await service.getContests()).to.deep.equal({
        ongoing: ongoingContests,
        upcoming: upcomingContests,
        finished: finishedContests
      })
    })
  })

  describe('getContestById', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.resolves(contest)
    })

    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      await expect(
        service.getContestById(userId, contestId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when user is not a group member and contest is not finished yet', async () => {
      const now = new Date()
      const notEndedContest = {
        ...contest,
        endTime: now.setFullYear(now.getFullYear() + 1)
      }
      mockPrismaService.contest.findUnique.resolves(notEndedContest)
      stub(groupService, 'getUserGroup').resolves(null)

      await expect(
        service.getContestById(userId, contestId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should return contest when user is not a group member and contest is finished', async () => {
      stub(groupService, 'getUserGroup').resolves(null)

      expect(await service.getContestById(userId, contestId)).to.deep.equal(
        contest
      )
    })

    it('should return contest of the group', async () => {
      stub(groupService, 'getUserGroup').resolves({
        isGroupLeader: false
      })

      expect(await service.getContestById(userId, contestId)).to.be.equal(
        contest
      )
    })
  })

  describe('getModalContestById', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      await expect(service.getModalContestById(contestId)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)

      expect(await service.getModalContestById(contestId)).to.deep.equal(
        contest
      )
    })
  })

  describe('getContestsByGroupId', () => {
    it('should return contests of the group', async () => {
      expect(await service.getContestsByGroupId(groupId)).to.deep.equal(
        contests
      )
    })
  })

  describe('getAdminContests', () => {
    it('should return contests in open space', async () => {
      stub(groupService, 'getUserGroupLeaderList').resolves([groupId])

      expect(await service.getAdminContests()).to.deep.equal(contests)
    })
  })

  describe('getAdminContestById', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      await expect(service.getAdminContestById(contestId)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)

      expect(await service.getAdminContestById(contestId)).to.deep.equal(
        contest
      )
    })
  })

  describe('getAdminContestsByGroupId', () => {
    it('should return contests of the group', async () => {
      expect(await service.getAdminContestsByGroupId(groupId)).to.deep.equal(
        contests
      )
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
      ).to.be.rejectedWith(ActionNotAllowedException)
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
      expect(res).to.equal([contestPublicizingRequest])
    })
  })

  describe('respondContestPublicizingRequest', () => {
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
      mockPrismaService.contest.findUnique.resolves(ongoingContest)
      mockPrismaService.contestRecord.findFirst.resolves(null)
    })
    afterEach(() => {
      mockPrismaService.contest.findUnique.resolves(contest)
      mockPrismaService.contestRecord.findFirst.resolves(null)
      mockPrismaService.contestRankACM.create.reset()
    })

    it('should throw error when the contest does not exist', async () => {
      mockPrismaService.contest.findUnique.resolves(null)
      await expect(
        service.createContestRecord(userId, contestId)
      ).to.be.rejectedWith(EntityNotExistException, 'contest')
    })

    it('should throw error when user is participated in contest again', async () => {
      mockPrismaService.contestRecord.findFirst.resolves(record)
      await expect(
        service.createContestRecord(userId, contestId)
      ).to.be.rejectedWith(
        ActionNotAllowedException,
        'repetitive participation'
      )
    })
    it('should throw error when contest is not ongoing', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)
      await expect(
        service.createContestRecord(userId, contestId)
      ).to.be.rejectedWith(ActionNotAllowedException, 'participation')
    })
    it('should successfully create contestRankACM', async () => {
      await service.createContestRecord(userId, contestId)
      expect(mockPrismaService.contestRankACM.create.calledOnce).to.be.true
    })
    // Todo: test other contest type -> create other contest record table
  })
})
