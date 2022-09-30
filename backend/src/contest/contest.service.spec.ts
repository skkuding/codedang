import { Test, TestingModule } from '@nestjs/testing'
import { Contest, ContestType } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
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

const contest = {
  id: contestId,
  createdById: userId,
  groupId: groupId,
  title: 'title',
  description: 'description',
  descriptionSummary: 'description summary',
  startTime: new Date('2021-11-07T18:34:23.999175+09:00'),
  endTime: new Date('2021-12-07T18:34:23.999175+09:00'),
  visible: true,
  isRankVisible: true,
  type: ContestType.ACM,
  createTime: new Date('2021-11-01T18:34:23.999175+09:00'),
  updateTime: new Date('2021-11-01T18:34:23.999175+09:00'),
  group: {
    groupId: groupId
  }
}

const ongoingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId,
    endTime: new Date('2022-11-07T18:34:23.999175+09:00'),
    visible: false
  }
]

const finishedContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 3,
    visible: false
  }
]

const upcomingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 6,
    startTime: new Date('2022-11-07T18:34:23.999175+09:00'),
    endTime: new Date('2022-12-07T18:34:23.999175+09:00'),
    visible: false
  }
]

const contests: Partial<Contest>[] = [
  ...ongoingContests,
  ...finishedContests,
  ...upcomingContests
]

const mockPrismaService = {
  contest: {
    findUnique: jest.fn().mockResolvedValue(contest),
    findMany: jest.fn().mockResolvedValue(contests),
    findFirst: jest.fn().mockResolvedValue(contest),
    create: jest.fn().mockResolvedValue(contest),
    update: jest.fn().mockResolvedValue(contest),
    delete: jest.fn()
  }
}

describe('ContestService', () => {
  let contestService: ContestService
  let groupService: GroupService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        GroupService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()
    contestService = module.get<ContestService>(ContestService)
    groupService = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(contestService).toBeDefined()
  })

  describe('createContest', () => {
    const createContestDto: CreateContestDto = {
      groupId: contest.groupId,
      title: contest.title,
      description: contest.description,
      descriptionSummary: contest.descriptionSummary,
      startTime: contest.startTime,
      endTime: contest.endTime,
      visible: contest.visible,
      isRankVisible: contest.isRankVisible,
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
      descriptionSummary: contest.descriptionSummary,
      startTime: contest.startTime,
      endTime: contest.endTime,
      visible: contest.visible,
      isRankVisible: contest.isRankVisible,
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
    const startTime = new Date('2022-12-07T18:34:23.999175+09:00')
    const endTime = new Date('2022-12-07T18:34:23.999175+09:00')

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

  describe('filterOngoing', () => {
    it('should return ongoing contests of the group', async () => {
      expect(contestService.filterOngoing(contests)).toEqual(ongoingContests)
    })
  })

  describe('filterUpcoming', () => {
    it('should return upcoming contests of the group', async () => {
      expect(contestService.filterUpcoming(contests)).toEqual(upcomingContests)
    })
  })

  describe('filterFinished', () => {
    it('should return ongoing contests of the group', async () => {
      expect(contestService.filterFinished(contests)).toEqual(finishedContests)
    })
  })

  describe('getContests', () => {
    it('should return ongoing, upcoming, finished contests', async () => {
      expect(await contestService.getContests()).toEqual({
        ongoing: ongoingContests,
        upcoming: upcomingContests,
        finished: finishedContests
      })
    })
  })

  describe('getContestById', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })

    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.mockRejectedValue(
        new EntityNotExistException('contest')
      )

      await expect(
        contestService.getContestById(userId, contestId)
      ).rejects.toThrow(EntityNotExistException)
    })

    it('should throw error when user is not a group member and contest is not finished yet', async () => {
      const now = new Date()
      const notEndedContest = {
        ...contest,
        endTime: now.setFullYear(now.getFullYear() + 1)
      }
      mockPrismaService.contest.findUnique.mockResolvedValue(notEndedContest)
      jest
        .spyOn(groupService, 'getUserGroupMembershipInfo')
        .mockResolvedValue(null)

      await expect(
        contestService.getContestById(userId, contestId)
      ).rejects.toThrow(ForbiddenAccessException)
    })

    it('should return contest when user is not a group member and contest is finished', async () => {
      jest
        .spyOn(groupService, 'getUserGroupMembershipInfo')
        .mockResolvedValue(null)

      expect(await contestService.getContestById(userId, contestId)).toEqual(
        contest
      )
    })

    it('should return contest of the group', async () => {
      jest
        .spyOn(groupService, 'getUserGroupMembershipInfo')
        .mockResolvedValue({ isRegistered: true, isGroupLeader: false })

      expect(await contestService.getContestById(userId, contestId)).toEqual(
        contest
      )
    })
  })

  describe('getModalContestById', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.mockRejectedValue(
        new EntityNotExistException('contest')
      )

      await expect(
        contestService.getModalContestById(contestId)
      ).rejects.toThrow(EntityNotExistException)
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)

      expect(await contestService.getModalContestById(contestId)).toEqual(
        contest
      )
    })
  })

  describe('getContestsByGroupId', () => {
    it('should return contests of the group', async () => {
      expect(await contestService.getContestsByGroupId(groupId)).toEqual(
        contests
      )
    })
  })

  describe('getAdminContests', () => {
    it('should return contests in groups whose user is group manager', async () => {
      jest
        .spyOn(groupService, 'getUserGroupLeaderList')
        .mockResolvedValue([groupId])

      expect(await contestService.getAdminContests(userId)).toEqual(contests)
    })
  })

  describe('getAdminOngoingContests', () => {
    it('should return ongoing contests in groups whose user is group manager', async () => {
      jest
        .spyOn(groupService, 'getUserGroupLeaderList')
        .mockResolvedValue([groupId])

      expect(await contestService.getAdminOngoingContests(userId)).toEqual(
        ongoingContests
      )
    })
  })

  describe('getAdminContestById', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.mockRejectedValue(
        new EntityNotExistException('contest')
      )

      await expect(
        contestService.getAdminContestById(contestId)
      ).rejects.toThrow(EntityNotExistException)
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)

      expect(await contestService.getAdminContestById(contestId)).toEqual(
        contest
      )
    })
  })

  describe('getAdminContestsByGroupId', () => {
    it('should return contests of the group', async () => {
      expect(await contestService.getAdminContestsByGroupId(groupId)).toEqual(
        contests
      )
    })
  })
})
