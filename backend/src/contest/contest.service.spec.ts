import { Test, TestingModule } from '@nestjs/testing'
import { Contest, ContestType, Group, UserGroup } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

const contestId = 1
const userId = 1
const groupId = 1

const contest: Contest = {
  id: contestId,
  created_by_id: userId,
  group_id: groupId,
  title: 'title',
  description: 'description',
  description_summary: 'description summary',
  start_time: new Date('2021-11-07T18:34:23.999175+09:00'),
  end_time: new Date('2021-12-07T18:34:23.999175+09:00'),
  visible: true,
  is_rank_visible: true,
  type: ContestType.ACM,
  create_time: new Date(),
  update_time: new Date()
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

const contestRankACM = {
  id: 1,
  contest_id: contestId,
  user_id: userId,
  accepted_problem_num: 0,
  total_penalty: 0,
  submission_info: {},
  create_time: new Date(),
  update_time: new Date()
}

const mockPrismaService = {
  contest: {
    findUnique: jest.fn().mockResolvedValue(contest),
    findMany: jest.fn().mockResolvedValue(contests),
    findFirst: jest.fn().mockResolvedValue(contest),
    create: jest.fn().mockResolvedValue(contest),
    update: jest.fn().mockResolvedValue(contest),
    delete: jest.fn()
  },
  contestRecord: {
    findFirst: jest.fn().mockResolvedValue(null)
  },
  userGroup: {
    findFirst: jest.fn().mockResolvedValue(userGroup),
    findMany: jest.fn().mockResolvedValue(userGroups)
  },
  group: {
    findMany: jest.fn().mockResolvedValue(returnAdminContests),
    findUnique: jest.fn().mockResolvedValue(group)
  },
  contestRankACM: {
    create: jest.fn().mockResolvedValue(contestRankACM)
  }
}

function returnTextIsNotAllowed(userId: number, contestId: number): string {
  return `Contest ${contestId} is not allowed to User ${contestId}`
}

describe('ContestService', () => {
  let contestService: ContestService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        GroupService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()
    contestService = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(contestService).toBeDefined()
  })

  describe('createContest', () => {
    const createContestDto: CreateContestDto = {
      group_id: contest.group_id,
      title: contest.title,
      description: contest.description,
      description_summary: contest.description_summary,
      start_time: contest.start_time,
      end_time: contest.end_time,
      visible: contest.visible,
      is_rank_visible: contest.is_rank_visible,
      type: contest.type
    }

    afterEach(() => {
      mockPrismaService.contest.create.mockClear()
    })

    it('should return created contest', async () => {
      //given

      //when
      const result = await contestService.createContest(
        userId,
        createContestDto
      )

      //then
      expect(mockPrismaService.contest.create).toBeCalledTimes(1)
      expect(result).toEqual(contest)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = jest
        .spyOn(contestService, 'isValidPeriod')
        .mockReturnValue(false)

      //when
      const callContestCreate = async () =>
        await contestService.createContest(userId, createContestDto)

      //then
      await expect(callContestCreate).rejects.toThrow(
        UnprocessableDataException
      )
      expect(mockPrismaService.contest.create).toBeCalledTimes(0)

      isValidPeriodSpy.mockRestore()
    })
  })

  describe('updateContest', () => {
    let callUpdateContest
    const updateContestDto: UpdateContestDto = {
      title: contest.title,
      description: contest.description,
      description_summary: contest.description_summary,
      start_time: contest.start_time,
      end_time: contest.end_time,
      visible: contest.visible,
      is_rank_visible: contest.is_rank_visible,
      type: contest.type
    }

    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
      callUpdateContest = async () =>
        await contestService.updateContest(contestId, updateContestDto)
    })
    afterEach(() => {
      mockPrismaService.contest.update.mockClear()
    })

    it('should return updated contest', async () => {
      //given

      //when
      const result = await contestService.updateContest(
        contestId,
        updateContestDto
      )

      //then
      expect(mockPrismaService.contest.update).toBeCalledTimes(1)
      expect(result).toBe(contest)
    })

    it('should throw error when the contest does not exist', async () => {
      //given
      mockPrismaService.contest.findUnique.mockRejectedValue(
        new EntityNotExistException('contest')
      )

      //when

      //then
      await expect(
        contestService.updateContest(contestId, updateContestDto)
      ).rejects.toThrow(EntityNotExistException)
      expect(mockPrismaService.contest.update).toBeCalledTimes(0)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = jest
        .spyOn(contestService, 'isValidPeriod')
        .mockReturnValue(false)

      //when

      //then
      await expect(callUpdateContest).rejects.toThrow(
        UnprocessableDataException
      )
      expect(mockPrismaService.contest.update).toBeCalledTimes(0)

      isValidPeriodSpy.mockRestore()
    })
  })

  describe('isValidPeriod', () => {
    const startTime = new Date()
    const endTime = new Date()

    it('should return true when given valid start time and end time', () => {
      //given
      endTime.setDate(startTime.getDate() + 1)

      //when
      const result = contestService.isValidPeriod(startTime, endTime)

      //then
      expect(result).toBe(true)
    })

    it('should return false when end time is ealier than start time', () => {
      //given
      endTime.setDate(startTime.getDate() - 1)

      //when
      const result = contestService.isValidPeriod(startTime, endTime)

      //then
      expect(result).toBeFalsy()
    })
  })

  describe('deleteContest', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })
    afterEach(() => {
      mockPrismaService.contest.delete.mockClear()
    })

    it('should successfully delete the contest', async () => {
      //given

      //when
      await contestService.deleteContest(contestId)

      //then
      expect(mockPrismaService.contest.delete).toBeCalledTimes(1)
    })

    it('should throw error when contest does not exist', async () => {
      //given
      mockPrismaService.contest.findUnique.mockRejectedValue(
        new EntityNotExistException('contest')
      )

      //when
      const callContestDelete = async () =>
        await contestService.deleteContest(contestId)

      //then
      await expect(callContestDelete).rejects.toThrow(EntityNotExistException)
      expect(mockPrismaService.contest.delete).toBeCalledTimes(0)
    })
  })

  describe('getContests', () => {
    it('모든 대회 리스트(ongoing, upcoming, finished)를 반환한다.', async () => {
      expect(await contestService.getContests()).toEqual({
        ongoing: ongoingContests,
        upcoming: upcomingContests,
        finished: finishedContests
      })
    })
  })

  describe('getContestById', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest),
        mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)
    })
    afterEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest),
        mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)
    })
    it('contest id에 해당하는 contest가 없다면 EntityNotExistException을 반환한다.', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(null)
      await expect(
        contestService.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new EntityNotExistException(`Contest ${contestId}`)
      )
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 진행중인 상태면 InvalidUserException을 반환한다.', async () => {
      mockPrismaService.userGroup.findFirst.mockResolvedValue(null)
      mockPrismaService.contest.findUnique.mockResolvedValue({
        ...contest,
        start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
        end_time: new Date('2022-12-07T18:34:23.999175+09:00')
      }) //ongoing
      await expect(
        contestService.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new InvalidUserException(returnTextIsNotAllowed(userId, contestId))
      )
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 아직 시작되지 않은 상태면 InvalidUserException을 반환한다.', async () => {
      mockPrismaService.userGroup.findFirst.mockResolvedValue(null)
      mockPrismaService.contest.findUnique.mockResolvedValue({
        ...contest,
        end_time: new Date('2022-11-07T18:34:23.999175+09:00')
      }) //upcoming
      await expect(
        contestService.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new InvalidUserException(returnTextIsNotAllowed(userId, contestId))
      )
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 끝난 상태면 contest id에 해당하는 contest를 반환한다.', async () => {
      mockPrismaService.userGroup.findFirst.mockResolvedValue(null)
      expect(await contestService.getContestById(userId, contestId)).toEqual(
        contest
      )
    })

    it('user가 contest가 속한 group의 멤버지만, visible==false 이고 user가 group manager가 아니라면 InvalidUserException을 반환한다.', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue({
        ...contest,
        visible: false
      })
      mockPrismaService.userGroup.findFirst.mockResolvedValue({
        ...userGroup,
        is_group_manager: false
      })
      await expect(
        contestService.getContestById(userId, contestId)
      ).rejects.toThrowError(
        new InvalidUserException(returnTextIsNotAllowed(userId, contestId))
      )
    })

    it('user가 contest가 속한 group의 멤버라면 주어진 contest id에 해당하는 대회를 반환한다.', async () => {
      expect(await contestService.getContestById(userId, contestId)).toEqual(
        contest
      )
    })
  })

  describe('getModalContestById', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })
    afterEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })
    it('contest id에 해당하는 contest가 없다면 EntityNotExistException을 반환한다.', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(null)
      await expect(
        contestService.getModalContestById(contestId)
      ).rejects.toThrowError(
        new EntityNotExistException(`Contest ${contestId}`)
      )
    })
    it('contest id에 해당하는 대회를 반환한다.', async () => {
      expect(await contestService.getModalContestById(contestId)).toEqual(
        contest
      )
    })
  })

  describe('getContestsByGroupId', () => {
    it('group id에 해당하는 모든 대회 리스트를 반환한다.', async () => {
      expect(await contestService.getContestsByGroupId(groupId)).toEqual(
        contests
      )
    })
  })

  describe('getAdminContests', () => {
    it('user가 group manager인 group의 모든 대회 리스트를 반환한다.', async () => {
      expect(await contestService.getAdminContests(userId)).toEqual(contests)
    })
  })

  describe('getAdminOngoingContests', () => {
    it('user가 group manager인 group의 모든 진행중인 대회 리스트를 반환한다.', async () => {
      expect(await contestService.getAdminOngoingContests(userId)).toEqual(
        ongoingContests
      )
    })
  })

  describe('getAdminContestById', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })
    afterEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })
    it('contest id에 해당하는 contest가 없다면 EntityNotExistException을 반환한다.', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(null)
      await expect(
        contestService.getAdminContestById(contestId)
      ).rejects.toThrowError(
        new EntityNotExistException(`Contest ${contestId}`)
      )
    })
    it('contest id에 해당하는 대회를 반환한다.', async () => {
      expect(await contestService.getAdminContestById(contestId)).toEqual(
        contest
      )
    })
  })

  describe('getAdminContestsByGroupId', () => {
    it('group id에 해당하는 모든 대회 리스트를 반환한다.', async () => {
      expect(await contestService.getAdminContestsByGroupId(groupId)).toEqual(
        contests
      )
    })
  })
})
