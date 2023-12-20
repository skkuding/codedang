import { Test, TestingModule } from '@nestjs/testing'
import type { Contest, Group, UserGroup } from '@prisma/client'
import { expect } from 'chai'
import dayjs from 'dayjs'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { AnnouncementService } from './announcement.service'

const contestId = 1
const userId = 1
const groupId = 1

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

const user = {
  id: userId,
  contest: userContests
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
  }
}

describe('AnnouncementService', () => {
  let service: AnnouncementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<AnnouncementService>(AnnouncementService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
