import { Test, TestingModule } from '@nestjs/testing'
import { Contest, Role, User, UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestService } from './contest.service'

const contestId = 1
const userId = 1
const groupId = 1

const user: User = {
  id: userId,
  username: 'username',
  password: 'password',
  email: 'email',
  has_email_authenticated: false,
  last_login: new Date(),
  create_time: new Date(),
  update_time: new Date(),
  role: Role.GroupAdmin
}

const userArray: User[] = [
  user,
  {
    ...user,
    id: userId + 1,
    role: Role.User
  }
]

const contestGroupId1: Contest = {
  id: contestId,
  title: 'title',
  description: 'description',
  start_time: new Date('2021-11-07T18:34:23.999175+09:00'),
  end_time: new Date('2021-12-07T18:34:23.999175+09:00'),
  visible: true,
  group_id: groupId,
  type: 'ACM',
  // description_summary: contestData.description_summary,
  created_by_id: userId,
  is_rank_visible: true,
  create_time: new Date(),
  update_time: new Date()
}

const contestGroupId2: Contest = {
  id: contestId,
  title: 'title',
  description: 'description',
  start_time: new Date('2021-11-07T18:34:23.999175+09:00'),
  end_time: new Date('2021-12-07T18:34:23.999175+09:00'),
  visible: true,
  group_id: groupId + 1,
  type: 'ACM',
  // description_summary: contestData.description_summary,
  created_by_id: userId,
  is_rank_visible: true,
  create_time: new Date(),
  update_time: new Date()
}

const ongoingContests = [
  {
    ...contestGroupId1,
    id: contestId,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    visible: false
  },
  {
    ...contestGroupId1,
    id: contestId + 1,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  },
  {
    ...contestGroupId2,
    id: contestId + 2,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  }
]

const finishedContests = [
  {
    ...contestGroupId1,
    id: contestId + 3,
    visible: false
  },
  {
    ...contestGroupId1,
    id: contestId + 4
  },
  {
    ...contestGroupId2,
    id: contestId + 5
  }
]

const upcomingContests = [
  {
    ...contestGroupId1,
    id: contestId + 6,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-12-07T18:34:23.999175+09:00'),
    visible: false
  },
  {
    ...contestGroupId1,
    id: contestId + 7,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  },
  {
    ...contestGroupId2,
    id: contestId + 8,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  }
]

const contestArray = ongoingContests.concat(finishedContests, upcomingContests)

const userGroup: UserGroup = {
  id: 1,
  user_id: userId,
  group_id: groupId,
  is_registered: true,
  is_group_manager: true,
  create_time: new Date(),
  update_time: new Date()
}

// const userGroupArray: UserGroup[] = [
//   userGroup,
//   {
//     ...userGroup,
//     user_id: userId + 1,
//     group_id: groupId + 1
//   }
// ]

const db = {
  contest: {
    findMany: jest.fn().mockResolvedValue(contestArray),
    findUnique: jest.fn().mockResolvedValue(contestGroupId1),
    findFirst: jest.fn().mockResolvedValue(contestGroupId1)
  },
  userGroup: {
    findFirst: jest.fn().mockResolvedValue(userGroup)
  }
}

describe('ContestService', () => {
  let service: ContestService
  // let prisma: PrismaService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestService, { provide: PrismaService, useValue: { db } }]
    }).compile()

    service = module.get<ContestService>(ContestService)
    // prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  /* public */
  describe('getOngoingContests', () => {
    it('진행중인 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getOngoingContests()
      expect(contests).toStrictEqual(ongoingContests)
    })
  })

  describe('getUpcomingContests', () => {
    it('아직 시작하지 않은 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getUpcomingContests()
      expect(contests).toStrictEqual(upcomingContests)
    })
  })

  describe('getFinishedContests', () => {
    it('마감된 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getFinishedContests()
      expect(contests).toStrictEqual(finishedContests)
    })
  })

  // Todo: user 권한
  describe('getContestById', () => {
    it('user가 contest가 속한 group의 멤버가 아니라면 InvalidUserException을 반환한다.', async () => {
      const result = await service.getContestById(userId, contestId)
      expect(result).toStrictEqual(contestId)
    })

    it('user가 contest가 속한 group의 멤버라면 주어진 contest id에 해당하는 대회를 반환한다.', async () => {
      const contest = await service.getContestById(userId, contestId)
      expect(contest.id).toStrictEqual(contestId)
    })
  })

  // Todo: user 권한
  /* group */
  describe('getContestsByGroupId', () => {
    it('주어진 group id에 해당하는 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getContestsByGroupId(userId, groupId)
      for (const contest in contests.group.Contest) {
        expect(JSON.parse(contest).group_id).toStrictEqual(groupId)
      }
    })
  })
  // Todo: user 권한
  /* admin */
  describe('getAdminContests', () => {
    it('관리자가 담당하는 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getAdminContests(userId)
      for (const contest in contests.group.Contest) {
        expect(JSON.parse(contest).user_id).toStrictEqual(userId)
      }
    })
  })
  // Todo: user 권한 ongoing 확인
  /*
  describe('getAdminOngoingContests', () => {
    it('관리자가 담당하는 모든 진행중인 대회 리스트를 반환한다.', async () => {
      const contests = await service.getAdminOngoingContests(userId)
      for (const contest in contests.group.Contest) {
        expect(JSON.parse(contest).user_id).toStrictEqual(userId)
      }
    })
  }) */
})
