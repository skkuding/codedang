import { Test, TestingModule } from '@nestjs/testing'
import { Contest, Group, UserGroup } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestService } from './contest.service'

const contestId = 1
const userId = 1
const groupId = 1

const contest: Partial<Contest> = {
  id: contestId,
  title: 'title',
  description: 'description',
  start_time: new Date('2021-11-07T18:34:23.999175+09:00'),
  end_time: new Date('2021-12-07T18:34:23.999175+09:00'),
  visible: true,
  group_id: groupId,
  type: 'ACM'
}

const ongoingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    visible: false
  },
  {
    ...contest,
    id: contestId + 1,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  },
  {
    ...contest,
    id: contestId + 2,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  }
]
const finishedContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 3,
    visible: false
  },
  {
    ...contest,
    id: contestId + 4
  },
  {
    ...contest,
    id: contestId + 5
  }
]
const upcomingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 6,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-12-07T18:34:23.999175+09:00'),
    visible: false
  },
  {
    ...contest,
    id: contestId + 7,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  },
  {
    ...contest,
    id: contestId + 8,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  }
]
const contests: Partial<Contest>[] = ongoingContests.concat(
  finishedContests,
  upcomingContests
)
const userGroup: UserGroup = {
  id: 1,
  user_id: userId,
  group_id: groupId,
  is_registered: true,
  is_group_manager: true,
  create_time: new Date(),
  update_time: new Date()
}
const userGroups: UserGroup[] = [
  userGroup,
  {
    ...userGroup,
    id: userGroup.id + 1,
    group_id: userGroup.group_id + 1
  }
]

const group: Group = {
  id: groupId,
  created_by_id: userId,
  group_name: 'groupname',
  private: true,
  invitation_code: 'invitation code',
  description: 'description',
  create_time: new Date(),
  update_time: new Date()
}

const adminContests = {
  id: groupId,
  group_name: 'groupname',
  Contest: contests
}
const returnAdminContests = [adminContests, adminContests]

const db = {
  contest: {
    findMany: jest.fn().mockResolvedValue(contests),
    findUnique: jest.fn().mockResolvedValue(contest),
    findFirst: jest.fn().mockResolvedValue(contest)
  },
  userGroup: {
    findFirst: jest.fn().mockResolvedValue(userGroup),
    findMany: jest.fn().mockResolvedValue(userGroups)
  },
  group: {
    findMany: jest.fn().mockResolvedValue(returnAdminContests),
    findUnique: jest.fn().mockResolvedValue(group)
  }
}

describe('ContestService', () => {
  let service: ContestService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestService, { provide: PrismaService, useValue: db }]
    }).compile()
    service = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  /* public */
  describe('getOngoingContests', () => {
    beforeEach(() => {
      db.contest.findMany.mockResolvedValue(ongoingContests)
    })
    afterEach(() => {
      db.contest.findMany.mockResolvedValue(contests)
    })
    it('진행중인 모든 대회 리스트를 반환한다.', async () => {
      expect(await service.getOngoingContests()).toEqual(ongoingContests)
    })
  })

  describe('getUpcomingContests', () => {
    beforeEach(() => {
      db.contest.findMany.mockResolvedValue(upcomingContests)
    })
    afterEach(() => {
      db.contest.findMany.mockResolvedValue(contests)
    })
    it('아직 시작하지 않은 모든 대회 리스트를 반환한다.', async () => {
      expect(await service.getUpcomingContests()).toEqual(upcomingContests)
    })
  })

  describe('getFinishedContests', () => {
    beforeEach(() => {
      db.contest.findMany.mockResolvedValue(finishedContests)
    })
    afterEach(() => {
      db.contest.findMany.mockResolvedValue(contests)
    })
    it('마감된 모든 대회 리스트를 반환한다.', async () => {
      expect(await service.getFinishedContests()).toEqual(finishedContests)
    })
  })

  describe('getContestById', () => {
    beforeEach(() => {
      db.contest.findUnique.mockResolvedValue(contest),
        db.userGroup.findFirst.mockResolvedValue(userGroup)
    })
    afterEach(() => {
      db.contest.findUnique.mockResolvedValue(contest),
        db.userGroup.findFirst.mockResolvedValue(userGroup)
    })
    it('contest id에 해당하는 contest가 없다면 EntityNotExistException을 반환한다.', async () => {
      db.contest.findUnique.mockResolvedValue(null)
      await expect(
        service.getContestById(userId, contestId)
      ).rejects.toThrowError(new EntityNotExistException('Contest 1'))
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 진행중인 상태면 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      db.contest.findUnique.mockResolvedValue({
        ...contest,
        start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
        end_time: new Date('2022-12-07T18:34:23.999175+09:00')
      }) //ongoing
      await expect(
        service.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new InvalidUserException('Contest 1 is not allowed to user 1')
      )
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 아직 시작되지 않은 상태면 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      db.contest.findUnique.mockResolvedValue({
        ...contest,
        end_time: new Date('2022-11-07T18:34:23.999175+09:00')
      }) //upcoming
      await expect(
        service.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new InvalidUserException('Contest 1 is not allowed to user 1')
      )
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 끝난 상태면 contest id에 해당하는 contest를 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      expect(await service.getContestById(userId, contestId)).toEqual(contest)
    })

    it('user가 contest가 속한 group의 멤버지만, visible==false 이고 user가 group manager가 아니라면 InvalidUserException을 반환한다.', async () => {
      db.contest.findUnique.mockResolvedValue({
        ...contest,
        visible: false
      })
      db.userGroup.findFirst.mockResolvedValue({
        ...userGroup,
        is_group_manager: false
      })
      await expect(
        service.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new InvalidUserException('Contest 1 is not allowed to user 1')
      )
    })

    it('user가 contest가 속한 group의 멤버라면 주어진 contest id에 해당하는 대회를 반환한다.', async () => {
      expect(await service.getContestById(userId, contestId)).toEqual(contest)
    })
  })

  /* group */
  describe('getContestsByGroupId', () => {
    beforeEach(() => {
      db.userGroup.findFirst.mockResolvedValue(userGroup),
        db.group.findUnique.mockResolvedValue(group)
    })
    afterEach(() => {
      db.userGroup.findFirst.mockResolvedValue(userGroup),
        db.group.findUnique.mockResolvedValue(group)
    })
    it('group id에 해당하는 group이 존재하지 않으면 EntityNotExistException을 반환한다.', async () => {
      db.group.findUnique.mockResolvedValue(null)
      await expect(
        service.getContestsByGroupId(userId, groupId)
      ).rejects.toThrowError(new EntityNotExistException('Group 1'))
    })

    it('user가 group id에 해당하는 group 멤버가 아니면 invalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      await expect(
        service.getContestsByGroupId(userId, groupId)
      ).rejects.toThrowError(
        new InvalidUserException('User 1 is not in Group 1')
      )
    })

    it('group id에 해당하는 group이 존재하고, user가 그 group에 소속되어 있다면, 주어진 group id에 해당하는 모든 대회 리스트를 반환한다.', async () => {
      const result = await service.getContestsByGroupId(userId, groupId)
      expect(result).toEqual(contests)
    })
  })

  /* admin */
  describe('getAdminContests', () => {
    beforeEach(() => {
      db.userGroup.findMany.mockResolvedValue(userGroups)
    })
    afterEach(() => {
      db.userGroup.findMany.mockResolvedValue(userGroups)
    })
    it('user가 group manager인 group이 존재하지 않을 때 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findMany.mockResolvedValue(null)
      await expect(service.getAdminContests(userId)).rejects.toThrowError(
        new InvalidUserException('User 1 is not group manager')
      )
    })

    it('user가 group manager인 group의 모든 대회 리스트를 반환한다.', async () => {
      const result = await service.getAdminContests(userId)
      for (const group of result) {
        expect(group['Contest']).toEqual(contests)
      }
    })
  })

  describe('getAdminOngoingContests', () => {
    beforeEach(() => {
      db.userGroup.findMany.mockResolvedValue(userGroups)
    })
    afterEach(() => {
      db.userGroup.findMany.mockResolvedValue(userGroups)
    })
    it('user가 group manager인 group이 존재하지 않을 때 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findMany.mockResolvedValue(null)
      await expect(
        service.getAdminOngoingContests(userId)
      ).rejects.toThrowError(
        new InvalidUserException('User 1 is not group manager')
      )
    })

    it('user가 group manager인 group의 모든 진행중인 대회 리스트를 반환한다.', async () => {
      const result = await service.getAdminOngoingContests(userId)
      for (const group of result) {
        expect(group['Contest']).toEqual(ongoingContests)
      }
    })
  })
})
