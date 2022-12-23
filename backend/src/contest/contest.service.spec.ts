import { Test, TestingModule } from '@nestjs/testing'
import {
  Contest,
  ContestPublicizingRequest,
  ContestType,
  RequestStatus,
  ContestRankACM,
  ContestRecord,
  UserGroup
} from '@prisma/client'
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
import { CreateContestPublicizingRequestDto } from './dto/create-publicizing-request.dto'
import { RespondContestPublicizingRequestDto } from './dto/respond-publicizing-request.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

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
  descriptionSummary: 'description summary',
  startTime: new Date('2021-12-01T14:00:00.000+09:00'),
  endTime: new Date('2021-12-01T15:00:00.000+09:00'),
  visible: true,
  isRankVisible: true,
  isPublic: false,
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
    endTime: new Date('2999-12-01T12:00:00.000+09:00'),
    visible: false
  }
]

const finishedContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 1,
    visible: false
  }
]

const upcomingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 6,
    startTime: new Date('2999-12-01T12:00:00.000+09:00'),
    endTime: new Date('2999-12-01T15:00:00.000+09:00'),
    visible: false
  }
]

const contests: Partial<Contest>[] = [
  ...ongoingContests,
  ...finishedContests,
  ...upcomingContests
]

const contestPublicizingRequest: ContestPublicizingRequest = {
  id: contestPublicizeRequestId,
  contestId: contestId,
  message: 'This is contest to public request',
  createdById: userId,
  requestStatus: RequestStatus.Pending,
  createTime: new Date('2022-12-07T18:34:23.999175+09:00'),
  updateTime: new Date('2022-12-07T18:34:23.999175+09:00')
}

const contestPublicizingRequests: ContestPublicizingRequest[] = [
  contestPublicizingRequest
]

const ongoingContest: Partial<Contest> = ongoingContests[0]

const userGroup: UserGroup = {
  id: 1,
  userId: userId,
  groupId: groupId,
  isRegistered: true,
  isGroupManager: true,
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
  rank: 1,
  createTime: new Date(),
  updateTime: new Date()
}
const contestRankACM: ContestRankACM = {
  id: 1,
  contestId: contestId,
  userId: userId,
  acceptedProblemNum: 0,
  totalPenalty: 0,
  submissionInfo: {},
  createTime: new Date(),
  updateTime: new Date()
}
const mockPrismaService = {
  contest: {
    findUnique: jest.fn().mockResolvedValue(contest),
    findMany: jest.fn().mockResolvedValue(contests),
    create: jest.fn().mockResolvedValue(contest),
    update: jest.fn().mockResolvedValue(contest),
    delete: jest.fn()
  },
  contestPublicizingRequest: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  contestRecord: {
    findFirst: jest.fn().mockResolvedValue(null)
  },
  userGroup: {
    findFirst: jest.fn().mockResolvedValue(userGroup),
    findMany: jest.fn().mockResolvedValue(userGroups)
  },
  contestRankACM: {
    create: jest.fn().mockResolvedValue(contestRankACM)
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
        .mockResolvedValue({ isRegistered: true, isGroupManager: false })

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
        .spyOn(groupService, 'getUserGroupManagerList')
        .mockResolvedValue([groupId])

      expect(await contestService.getAdminContests(userId)).toEqual(contests)
    })
  })

  describe('getAdminOngoingContests', () => {
    it('should return ongoing contests in groups whose user is group manager', async () => {
      jest
        .spyOn(groupService, 'getUserGroupManagerList')
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

  describe('createContestPublicizingRequest', () => {
    const createContestPublicizingRequestDto: CreateContestPublicizingRequestDto =
      {
        contestId: contestId,
        message: 'This is contest to public request'
      }

    afterEach(() => {
      mockPrismaService.contestPublicizingRequest.create.mockClear()
    })

    it('should return created request when contest does not have accepted or pending request', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        null
      )
      mockPrismaService.contestPublicizingRequest.create.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      const result = await contestService.createContestPublicizingRequest(
        userId,
        createContestPublicizingRequestDto
      )

      //then
      expect(
        mockPrismaService.contestPublicizingRequest.create
      ).toBeCalledTimes(1)
      expect(result).toEqual(contestPublicizingRequest)
    })

    it('should throw error when existing accepted request for the contest', async () => {
      //given
      const acceptedRequest: ContestPublicizingRequest = {
        ...contestPublicizingRequest,
        requestStatus: RequestStatus.Accepted
      }
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        acceptedRequest
      )

      //when
      const callCreateContestPublicizingRequest = async () =>
        await contestService.createContestPublicizingRequest(
          userId,
          createContestPublicizingRequestDto
        )

      //then
      await expect(callCreateContestPublicizingRequest).rejects.toThrow(
        ActionNotAllowedException
      )
    })

    it('should throw error when existing pending request for the contest', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      const callCreateContestPublicizingRequest = async () =>
        await contestService.createContestPublicizingRequest(
          userId,
          createContestPublicizingRequestDto
        )

      //then
      await expect(callCreateContestPublicizingRequest).rejects.toThrow(
        ActionNotAllowedException
      )
    })
  })

  describe('deleteContestPublicizingRequest', () => {
    afterEach(() => {
      mockPrismaService.contestPublicizingRequest.delete.mockClear()
    })

    it('should throw error when request for the contest does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.mockRejectedValue(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callDeleteContestPublicizingRequest = async () =>
        await contestService.deleteContestPublicizingRequest(
          contestId,
          contestPublicizeRequestId
        )

      //then
      await expect(callDeleteContestPublicizingRequest).rejects.toThrow(
        EntityNotExistException
      )
    })

    it('should throw error when request status is Accepted', async () => {
      //given
      const acceptedRequest: ContestPublicizingRequest = {
        ...contestPublicizingRequest,
        requestStatus: RequestStatus.Accepted
      }
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        acceptedRequest
      )

      //when
      const callDeleteContestPublicizingRequest = async () =>
        await contestService.deleteContestPublicizingRequest(
          contestId,
          contestPublicizeRequestId
        )

      //then
      await expect(callDeleteContestPublicizingRequest).rejects.toThrow(
        ActionNotAllowedException
      )
    })

    it('should throw error when request status is Rejected', async () => {
      //given
      const rejectedRequest: ContestPublicizingRequest = {
        ...contestPublicizingRequest,
        requestStatus: RequestStatus.Rejected
      }
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        rejectedRequest
      )

      //when
      const callDeleteContestPublicizingRequest = async () =>
        await contestService.deleteContestPublicizingRequest(
          contestId,
          contestPublicizeRequestId
        )

      //then
      await expect(callDeleteContestPublicizingRequest).rejects.toThrow(
        ActionNotAllowedException
      )
    })

    it('should delete request for given contest id when request stauts is Pending', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      await contestService.deleteContestPublicizingRequest(
        contestId,
        contestPublicizeRequestId
      )

      //then
      expect(
        mockPrismaService.contestPublicizingRequest.delete
      ).toBeCalledTimes(1)
    })
  })

  describe('deletePendingContestPublicizingRequest', () => {
    let requestStatus: RequestStatus

    afterEach(() => {
      mockPrismaService.contestPublicizingRequest.delete.mockClear()
    })

    it('should throw error when request status is Accepted', async () => {
      //given
      requestStatus = RequestStatus.Accepted

      //when
      const callDeletePendingContestPublicizingRequest = async () =>
        await contestService.deletePendingContestPublicizingRequest(
          requestStatus,
          contestPublicizeRequestId
        )

      //then
      await expect(callDeletePendingContestPublicizingRequest).rejects.toThrow(
        ActionNotAllowedException
      )
    })

    it('should throw error when request status is Rejected', async () => {
      //given
      requestStatus = RequestStatus.Rejected

      //when
      const callDeletePendingContestPublicizingRequest = async () =>
        await contestService.deletePendingContestPublicizingRequest(
          requestStatus,
          contestPublicizeRequestId
        )

      //then
      await expect(callDeletePendingContestPublicizingRequest).rejects.toThrow(
        ActionNotAllowedException
      )
    })

    it('should delete request when request stauts is Pending', async () => {
      //given
      requestStatus = RequestStatus.Pending

      //when
      await contestService.deletePendingContestPublicizingRequest(
        requestStatus,
        contestPublicizeRequestId
      )

      //then
      expect(
        mockPrismaService.contestPublicizingRequest.delete
      ).toBeCalledTimes(1)
    })
  })

  describe('getContestPublicizingRequests', () => {
    it('should return requests for given contestId', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findMany.mockResolvedValue(
        contestPublicizingRequests
      )

      //when
      const result = await contestService.getContestPublicizingRequests(
        contestId
      )

      //then
      expect(result).toEqual(contestPublicizingRequests)
    })
  })

  describe('getContestPublicizingRequest', () => {
    it('should return request for given id', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      const result = await contestService.getContestPublicizingRequest(
        contestId,
        contestPublicizeRequestId
      )

      //then
      expect(result).toEqual(contestPublicizingRequest)
    })

    it('should throw error when request does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.mockRejectedValue(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callGetContestPublicizingRequest = async () =>
        await contestService.getContestPublicizingRequest(
          contestId,
          contestPublicizeRequestId
        )

      //then
      await expect(callGetContestPublicizingRequest).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('respondContestPublicizingRequest', () => {
    let respondContestPublicizingRequestDto: RespondContestPublicizingRequestDto =
      {
        requestStatus: RequestStatus.Accepted
      }

    it('should update contest and request', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      await contestService.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        respondContestPublicizingRequestDto
      )

      //then
      expect(mockPrismaService.contest.update).toBeCalledTimes(1)
      expect(
        mockPrismaService.contestPublicizingRequest.update
      ).toBeCalledTimes(1)
    })

    it('should throw error when request for the contest does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.mockRejectedValue(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callRespondContestPublicizingRequest = async () =>
        await contestService.respondContestPublicizingRequest(
          contestPublicizeRequestId,
          respondContestPublicizingRequestDto
        )

      //then
      await expect(callRespondContestPublicizingRequest).rejects.toThrow(
        EntityNotExistException
      )
    })

    it('should update contest is_public as true when given request_status is Accepted', async () => {
      //given
      const updateContestIsPublicSpy = jest.spyOn(
        contestService,
        'updateContestIsPublic'
      )
      mockPrismaService.contestPublicizingRequest.findUnique.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      await contestService.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        respondContestPublicizingRequestDto
      )

      //then
      expect(updateContestIsPublicSpy).toBeCalledWith(contestId, true)
    })

    it('should update contest is_public as false when given request_status is Reject', async () => {
      //given
      const updateContestIsPublicSpy = jest.spyOn(
        contestService,
        'updateContestIsPublic'
      )
      mockPrismaService.contestPublicizingRequest.findUnique.mockResolvedValue(
        contestPublicizingRequest
      )
      respondContestPublicizingRequestDto = {
        requestStatus: RequestStatus.Rejected
      }

      //when
      await contestService.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        respondContestPublicizingRequestDto
      )

      //then
      expect(updateContestIsPublicSpy).toBeCalledWith(contestId, false)
    })
  })

  describe('getAdminContestPublicizingRequests', () => {
    it('should return requests for given where option', async () => {
      //given
      const whereOption = [RequestStatus.Pending]
      mockPrismaService.contestPublicizingRequest.findMany.mockResolvedValue(
        contestPublicizingRequests
      )

      //when
      const result = await contestService.getAdminContestPublicizingRequests(
        whereOption
      )

      //then
      expect(result).toEqual(contestPublicizingRequests)
    })
  })

  describe('getAdminContestPublicizingRequest', () => {
    it('should return request for given contest id', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.mockResolvedValue(
        contestPublicizingRequest
      )

      //when
      const result = await contestService.getAdminContestPublicizingRequest(
        contestPublicizeRequestId
      )

      //then
      expect(result).toEqual(contestPublicizingRequest)
    })

    it('should throw error when request for given contest id does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.mockRejectedValue(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callGetAdminContestPublicizingRequest = async () =>
        await contestService.getAdminContestPublicizingRequest(
          contestPublicizeRequestId
        )

      //then
      await expect(callGetAdminContestPublicizingRequest).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('createContestRecord', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(ongoingContest)
      mockPrismaService.contestRecord.findFirst.mockResolvedValue(null)
    })
    afterEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
      mockPrismaService.contestRecord.findFirst.mockResolvedValue(null)
      mockPrismaService.contestRankACM.create.mockClear()
    })

    it('should throw error when the contest does not exist', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(null)
      await expect(
        contestService.createContestRecord(userId, contestId)
      ).rejects.toThrowError(new EntityNotExistException('contest'))
    })

    it('should throw error when user is participated in contest again', async () => {
      mockPrismaService.contestRecord.findFirst.mockResolvedValue(record)
      await expect(
        contestService.createContestRecord(userId, contestId)
      ).rejects.toThrowError(
        new ActionNotAllowedException('repetitive participation', 'contest')
      )
    })
    it('should throw error when contest is not ongoing', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
      await expect(
        contestService.createContestRecord(userId, contestId)
      ).rejects.toThrowError(
        new ActionNotAllowedException('participation', 'ended contest')
      )
    })
    it('should successfully create contestRankACM', async () => {
      await contestService.createContestRecord(userId, contestId)
      expect(mockPrismaService.contestRankACM.create).toBeCalledTimes(1)
    })
    // Todo: test other contest type -> create other contest record table
  })
})
