import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  type Contest,
  type ContestRecord,
  type Group,
  type UserGroup
} from '@prisma/client'
import { expect } from 'chai'
import * as dayjs from 'dayjs'
import { stub } from 'sinon'
import { ConflictFoundException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { ContestService } from './contest.service'

const contestId = 1
const userId = 1
const groupId = 1
const undefinedUserId = undefined

const contest = {
  id: contestId,
  createdById: userId,
  groupId,
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

const ongoingContests = [
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
] satisfies Partial<Contest>[]

const finishedContests = [
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
] satisfies Partial<Contest>[]

const upcomingContests = [
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
] satisfies Partial<Contest>[]

const registeredOngoingContests = [
  {
    ...contest,
    id: contestId,
    endTime: new Date('2999-12-01T12:00:00.000+09:00'),
    config: {
      isVisible: false,
      isRankisVisible: true
    }
  }
] satisfies Partial<Contest>[]

const registeredUpcomingContests = [
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
] satisfies Partial<Contest>[]

const contests = [
  ...ongoingContests,
  ...finishedContests,
  ...upcomingContests
] satisfies Partial<Contest>[]

const userContests = [
  ...registeredOngoingContests,
  ...registeredUpcomingContests
] satisfies Partial<Contest>[]

const ongoingContest = ongoingContests[0]

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

const userGroup: UserGroup = {
  userId,
  groupId,
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
  contestId,
  userId,
  acceptedProblemNum: 0,
  totalPenalty: 0,
  createTime: new Date(),
  updateTime: new Date()
}

const mockPrismaService = {
  contest: {
    findUnique: stub().resolves(contest),
    findUniqueOrThrow: stub().resolves(contest),
    findFirst: stub().resolves(contest),
    findFirstOrThrow: stub().resolves(contest),
    findMany: stub().resolves(contests)
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
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ContestService', () => {
  let service: ContestService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()
    service = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContests', () => {
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
      mockPrismaService.contest.findUniqueOrThrow.rejects(
        new Prisma.PrismaClientKnownRequestError('contest', {
          code: 'P2002',
          clientVersion: '5.1.1'
        })
      )

      await expect(service.getContest(contestId, groupId)).to.be.rejectedWith(
        Prisma.PrismaClientKnownRequestError
      )
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(contestDetail)

      expect(await service.getContest(groupId, contestId)).to.deep.equal(
        contestDetail
      )
    })
  })

  describe('createContestRecord', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(ongoingContest)
      mockPrismaService.contestRecord.findFirst.resolves(null)
    })
    afterEach(() => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(contest)
      mockPrismaService.contestRecord.findFirst.resolves(null)
    })

    it('should throw error when the contest does not exist', async () => {
      mockPrismaService.contest.findUniqueOrThrow.rejects(
        new Prisma.PrismaClientKnownRequestError('contest', {
          code: 'P2002',
          clientVersion: '5.1.1'
        })
      )
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })

    it('should throw error when user is participated in contest again', async () => {
      mockPrismaService.contestRecord.findFirst.resolves(record)
      await expect(
        service.createContestRecord(contestId, userId)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when contest is not ongoing', async () => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(finishedContests[0])
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
