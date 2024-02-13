import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  type Contest,
  type ContestRecord,
  type Group
} from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import * as dayjs from 'dayjs'
import { stub } from 'sinon'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { type ContestSelectResult, ContestService } from './contest.service'

const contestId = 1
const userId = 1
const groupId = 1
const undefinedUserId = undefined

const now = dayjs()

const contest = {
  id: contestId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime: now.add(-1, 'day').toDate(),
  endTime: now.add(1, 'day').toDate(),
  config: {
    isVisible: true,
    isRankVisible: true
  },
  createTime: now.add(-1, 'day').toDate(),
  updateTime: now.add(-1, 'day').toDate(),
  group: {
    id: groupId,
    groupName: 'group'
  }
} satisfies Contest & {
  group: Partial<Group>
}
const upcomingContest = {
  ...contest,
  startTime: now.add(1, 'day').toDate(),
  endTime: now.add(2, 'day').toDate()
}

const contestDetail = {
  id: contest.id,
  group: contest.group,
  title: contest.title,
  description: contest.description,
  startTime: contest.startTime,
  endTime: contest.endTime,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    contestRecord: 1
  }
}

const ongoingContests = [
  {
    id: contest.id,
    group: contest.group,
    title: contest.title,
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _count: {
      contestRecord: 1
    }
  }
] satisfies Partial<ContestSelectResult>[]
const ongoingContestsWithParticipants = [
  {
    id: contest.id,
    group: contest.group,
    title: contest.title,
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    participants: 1
  }
]

const finishedContests = [
  {
    id: contest.id + 1,
    group: contest.group,
    title: contest.title,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _count: {
      contestRecord: 1
    }
  }
] satisfies Partial<ContestSelectResult>[]
const finishedContestsWithParticipants = [
  {
    id: contest.id + 1,
    group: contest.group,
    title: contest.title,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    participants: 1
  }
]

const upcomingContests = [
  {
    id: contest.id + 6,
    group: contest.group,
    title: contest.title,
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _count: {
      contestRecord: 1
    }
  }
] satisfies Partial<ContestSelectResult>[]
const upcomingContestsWithParticipants = [
  {
    id: contest.id + 6,
    group: contest.group,
    title: contest.title,
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    participants: 1
  }
]

const registeredOngoingContestsWithParticipants = [
  {
    id: contest.id,
    group: contest.group,
    title: contest.title,
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    participants: 1
  }
]

const registeredFinishedContestsWithParticipants = [
  {
    id: contest.id + 1,
    group: contest.group,
    title: contest.title,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    participants: 1
  }
]

const registeredUpcomingContestsWithParticipants = [
  {
    id: contest.id + 6,
    group: contest.group,
    title: contest.title,
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    participants: 1
  }
]

const contests = [
  ...ongoingContests,
  ...finishedContests,
  ...upcomingContests
] satisfies Partial<ContestSelectResult>[]

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

const record: ContestRecord = {
  id: 1,
  contestId,
  userId,
  acceptedProblemNum: 0,
  score: 0,
  totalPenalty: 0,
  createTime: new Date(),
  updateTime: new Date()
}
const sortedContestRecordsWithUserDetail = [
  {
    user: {
      id: 13,
      username: 'user10'
    },
    score: 36,
    totalPenalty: 720
  },
  {
    user: {
      id: 12,
      username: 'user09'
    },
    score: 33,
    totalPenalty: 660
  },
  {
    user: {
      id: 11,
      username: 'user08'
    },
    score: 30,
    totalPenalty: 600
  }
]

const mockPrismaService = {
  contest: {
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    findFirst: stub(),
    findFirstOrThrow: stub(),
    findMany: stub()
  },
  contestRecord: {
    findFirst: stub(),
    findFirstOrThrow: stub(),
    findMany: stub(),
    create: stub(),
    delete: stub()
  },
  userGroup: {
    findFirst: stub(),
    findMany: stub()
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
    beforeEach(() => {
      mockPrismaService.contest.findMany.resolves(contests)
      mockPrismaService.contestRecord.findMany.resolves([record])
    })
    afterEach(() => {
      mockPrismaService.contest.findMany.reset()
    })
    it('should return ongoing, upcoming contests when userId is undefined', async () => {
      expect(
        await service.getContestsByGroupId(undefinedUserId, groupId)
      ).to.deep.equal({
        ongoing: ongoingContestsWithParticipants,
        upcoming: upcomingContestsWithParticipants
      })
    })

    it('should return registered ongoing, registered upcoming, registered finished, ongoing, upcoming, finished contests', async () => {
      expect(await service.getContestsByGroupId(userId, groupId)).to.deep.equal(
        {
          registeredOngoing: registeredOngoingContestsWithParticipants,
          registeredUpcoming: registeredUpcomingContestsWithParticipants,
          registeredFinished: registeredFinishedContestsWithParticipants,
          ongoing: ongoingContestsWithParticipants,
          upcoming: upcomingContestsWithParticipants,
          finished: finishedContestsWithParticipants
        }
      )
    })
  })

  describe('getFinishedContests', () => {
    after(() => {
      mockPrismaService.contest.findMany.reset()
    })
    it('should return finished contests when cursor is 0', async () => {
      mockPrismaService.contest.findMany.resolves(finishedContests)
      expect(await service.getFinishedContestsByGroupId(null, 1)).to.deep.equal(
        {
          finished: finishedContestsWithParticipants
        }
      )
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
        ongoing: ongoingContestsWithParticipants,
        upcoming: upcomingContestsWithParticipants
      })
      mockPrismaService.contest.findMany.reset()
    })

    //TODO: test when userId is given
  })

  describe('getContest', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUniqueOrThrow.rejects(
        new Prisma.PrismaClientKnownRequestError('contest', {
          code: 'P2025',
          clientVersion: '5.8.1'
        })
      )

      await expect(
        service.getContest(contestId + 999, groupId, 4)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(contestDetail)
      mockPrismaService.contestRecord.findMany.resolves(
        sortedContestRecordsWithUserDetail
      )

      expect(await service.getContest(groupId, contestId, 4)).to.deep.equal({
        ...contestDetail,
        standings: sortedContestRecordsWithUserDetail.map((record, index) => ({
          ...record,
          standing: index + 1
        })),
        canRegister: true
      })
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
  describe('deleteContestRecord', () => {
    it('should return deleted contest record', async () => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(upcomingContest)
      mockPrismaService.contestRecord.findFirstOrThrow.resolves(record)
      mockPrismaService.contestRecord.delete.resolves(record)
      expect(
        await service.deleteContestRecord(contestId, userId)
      ).to.deep.equal(record)
    })

    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUniqueOrThrow.rejects(
        new PrismaClientKnownRequestError('contest', {
          code: 'P2025',
          clientVersion: '5.8.1'
        })
      )
      await expect(
        service.deleteContestRecord(contestId, userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
    it('should throw error when contest record does not exist', async () => {
      mockPrismaService.contestRecord.findFirstOrThrow.rejects(
        new PrismaClientKnownRequestError('contestRecord', {
          code: 'P2025',
          clientVersion: '5.8.1'
        })
      )
      await expect(
        service.deleteContestRecord(contestId, userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
    it('should throw error when contest is ongoing', async () => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(ongoingContest)
      mockPrismaService.contestRecord.findFirstOrThrow.resolves(record)
      await expect(
        service.deleteContestRecord(contestId, userId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw error when there is no record to delete', async () => {
      mockPrismaService.contest.findUniqueOrThrow.resolves(upcomingContest)
      mockPrismaService.contestRecord.findFirstOrThrow.resolves(record)
      mockPrismaService.contestRecord.delete.rejects(
        new PrismaClientKnownRequestError('contestRecord', {
          code: 'P2025',
          clientVersion: '5.8.1'
        })
      )
      await expect(
        service.deleteContestRecord(contestId, userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
