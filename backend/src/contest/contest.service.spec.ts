import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub, spy } from 'sinon'
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
    findUnique: stub().resolves(contest),
    findMany: stub().resolves(contests),
    create: stub().resolves(contest),
    update: stub().resolves(contest),
    delete: stub()
  },
  contestPublicizingRequest: {
    findUnique: stub(),
    findFirst: stub(),
    findMany: stub(),
    create: stub(),
    update: stub(),
    delete: stub()
  },
  contestRecord: {
    findFirst: stub().resolves(null)
  },
  userGroup: {
    findFirst: stub().resolves(userGroup),
    findMany: stub().resolves(userGroups)
  },
  contestRankACM: {
    create: stub().resolves(contestRankACM)
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
    expect(contestService).to.be.ok
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
      mockPrismaService.contest.create.reset()
    })

    it('should return created contest', async () => {
      //given

      //when
      const result = await contestService.createContest(
        userId,
        createContestDto
      )

      //then
      expect(mockPrismaService.contest.create.calledOnce).to.be.true
      expect(result).to.deep.equal(contest)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = stub(contestService, 'isValidPeriod').returns(
        false
      )

      //when
      const callContestCreate = async () =>
        await contestService.createContest(userId, createContestDto)

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
      descriptionSummary: contest.descriptionSummary,
      startTime: contest.startTime,
      endTime: contest.endTime,
      visible: contest.visible,
      isRankVisible: contest.isRankVisible,
      type: contest.type
    }

    beforeEach(() => {
      mockPrismaService.contest.findUnique.resolves(contest)
      callUpdateContest = async () =>
        await contestService.updateContest(contestId, updateContestDto)
    })

    afterEach(() => {
      mockPrismaService.contest.update.reset()
    })

    it('should return updated contest', async () => {
      //given

      //when
      const result = await contestService.updateContest(
        contestId,
        updateContestDto
      )

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
        contestService.updateContest(contestId, updateContestDto)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(mockPrismaService.contest.update.called).to.be.false
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = stub(contestService, 'isValidPeriod').returns(
        false
      )

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
      const result = contestService.isValidPeriod(startTime, endTime)

      //then
      expect(result).to.equal(true)
    })

    it('should return false when end time is ealier than start time', () => {
      //given
      endTime.setDate(startTime.getDate() - 1)

      //when
      const result = contestService.isValidPeriod(startTime, endTime)

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
      await contestService.deleteContest(contestId)

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
        await contestService.deleteContest(contestId)

      //then
      await expect(callContestDelete()).to.be.rejectedWith(
        EntityNotExistException
      )
      expect(mockPrismaService.contest.delete.called).to.be.false
    })
  })

  describe('filterOngoing', () => {
    it('should return ongoing contests of the group', async () => {
      expect(contestService.filterOngoing(contests)).to.deep.equal(
        ongoingContests
      )
    })
  })

  describe('filterUpcoming', () => {
    it('should return upcoming contests of the group', async () => {
      expect(contestService.filterUpcoming(contests)).to.deep.equal(
        upcomingContests
      )
    })
  })

  describe('filterFinished', () => {
    it('should return ongoing contests of the group', async () => {
      expect(contestService.filterFinished(contests)).to.deep.equal(
        finishedContests
      )
    })
  })

  describe('getContests', () => {
    it('should return ongoing, upcoming, finished contests', async () => {
      expect(await contestService.getContests()).to.deep.equal({
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
        contestService.getContestById(userId, contestId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when user is not a group member and contest is not finished yet', async () => {
      const now = new Date()
      const notEndedContest = {
        ...contest,
        endTime: now.setFullYear(now.getFullYear() + 1)
      }
      mockPrismaService.contest.findUnique.resolves(notEndedContest)
      stub(groupService, 'getUserGroupMembershipInfo').resolves(null)

      await expect(
        contestService.getContestById(userId, contestId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should return contest when user is not a group member and contest is finished', async () => {
      stub(groupService, 'getUserGroupMembershipInfo').resolves(null)

      expect(
        await contestService.getContestById(userId, contestId)
      ).to.deep.equal(contest)
    })

    it('should return contest of the group', async () => {
      stub(groupService, 'getUserGroupMembershipInfo').resolves({
        isRegistered: true,
        isGroupLeader: false
      })

      expect(
        await contestService.getContestById(userId, contestId)
      ).to.be.equal(contest)
    })
  })

  describe('getModalContestById', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      await expect(
        contestService.getModalContestById(contestId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)

      expect(await contestService.getModalContestById(contestId)).to.deep.equal(
        contest
      )
    })
  })

  describe('getContestsByGroupId', () => {
    it('should return contests of the group', async () => {
      expect(
        await contestService.getContestsByGroupId(groupId, 0, 3)
      ).to.deep.equal(contests)
    })
  })

  describe('getAdminContests', () => {
    it('should return contests in open space', async () => {
      expect(await contestService.getAdminContests(0, 3)).to.deep.equal(
        contests
      )
    })
  })

  describe('getAdminOngoingContests', () => {
    it('should return ongoing contests in open space', async () => {
      mockPrismaService.contest.findMany.resolves(ongoingContests)

      expect(await contestService.getAdminOngoingContests(0, 1)).to.deep.equal(
        ongoingContests
      )
    })
  })

  describe('getAdminContestById', () => {
    it('should throw error when contest does not exist', async () => {
      mockPrismaService.contest.findUnique.rejects(
        new EntityNotExistException('contest')
      )

      await expect(
        contestService.getAdminContestById(contestId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should return contest', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)

      expect(await contestService.getAdminContestById(contestId)).to.deep.equal(
        contest
      )
    })
  })

  describe('getAdminContestsByGroupId', () => {
    it('should return contests of the group', async () => {
      mockPrismaService.contest.findMany.resolves(contests)
      expect(
        await contestService.getAdminContestsByGroupId(groupId, 0, 3)
      ).to.deep.equal(contests)
    })
  })

  describe('createContestPublicizingRequest', () => {
    const createContestPublicizingRequestDto: CreateContestPublicizingRequestDto =
      {
        contestId: contestId,
        message: 'This is contest to public request'
      }

    afterEach(() => {
      mockPrismaService.contestPublicizingRequest.create.reset()
    })

    it('should return created request when contest does not have accepted or pending request', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(null)
      mockPrismaService.contestPublicizingRequest.create.resolves(
        contestPublicizingRequest
      )

      //when
      const result = await contestService.createContestPublicizingRequest(
        userId,
        createContestPublicizingRequestDto
      )

      //then
      expect(mockPrismaService.contestPublicizingRequest.create.calledOnce).to
        .be.true
      expect(result).to.equal(contestPublicizingRequest)
    })

    it('should throw error when existing accepted request for the contest', async () => {
      //given
      const acceptedRequest: ContestPublicizingRequest = {
        ...contestPublicizingRequest,
        requestStatus: RequestStatus.Accepted
      }
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(
        acceptedRequest
      )

      //when
      const callCreateContestPublicizingRequest = async () =>
        await contestService.createContestPublicizingRequest(
          userId,
          createContestPublicizingRequestDto
        )

      //then
      await expect(callCreateContestPublicizingRequest()).to.be.rejectedWith(
        ActionNotAllowedException
      )
    })

    it('should throw error when existing pending request for the contest', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(
        contestPublicizingRequest
      )

      //when
      const callCreateContestPublicizingRequest = async () =>
        await contestService.createContestPublicizingRequest(
          userId,
          createContestPublicizingRequestDto
        )

      //then
      await expect(callCreateContestPublicizingRequest()).to.be.rejectedWith(
        ActionNotAllowedException
      )
    })
  })

  describe('deleteContestPublicizingRequest', () => {
    afterEach(() => {
      mockPrismaService.contestPublicizingRequest.delete.reset()
    })

    it('should throw error when request for the contest does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.rejects(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callDeleteContestPublicizingRequest = async () =>
        await contestService.deleteContestPublicizingRequest(
          contestPublicizeRequestId
        )

      //then
      await expect(callDeleteContestPublicizingRequest()).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when request status is Accepted', async () => {
      //given
      const acceptedRequest: ContestPublicizingRequest = {
        ...contestPublicizingRequest,
        requestStatus: RequestStatus.Accepted
      }
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(
        acceptedRequest
      )

      //when
      const callDeleteContestPublicizingRequest = async () =>
        await contestService.deleteContestPublicizingRequest(
          contestPublicizeRequestId
        )

      //then
      await expect(callDeleteContestPublicizingRequest()).to.be.rejectedWith(
        ActionNotAllowedException
      )
    })

    it('should throw error when request status is Rejected', async () => {
      //given
      const rejectedRequest: ContestPublicizingRequest = {
        ...contestPublicizingRequest,
        requestStatus: RequestStatus.Rejected
      }
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(
        rejectedRequest
      )

      //when
      const callDeleteContestPublicizingRequest = async () =>
        await contestService.deleteContestPublicizingRequest(
          contestPublicizeRequestId
        )

      //then
      await expect(callDeleteContestPublicizingRequest()).to.be.rejectedWith(
        ActionNotAllowedException
      )
    })

    it('should delete request for given contest id when request stauts is Pending', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(
        contestPublicizingRequest
      )

      //when
      await contestService.deleteContestPublicizingRequest(
        contestPublicizeRequestId
      )

      //then
      expect(mockPrismaService.contestPublicizingRequest.delete.calledOnce).to
        .be.true
    })
  })

  describe('deletePendingContestPublicizingRequest', () => {
    let requestStatus: RequestStatus

    afterEach(() => {
      mockPrismaService.contestPublicizingRequest.delete.reset()
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
      await expect(
        callDeletePendingContestPublicizingRequest()
      ).to.be.rejectedWith(ActionNotAllowedException)
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
      await expect(
        callDeletePendingContestPublicizingRequest()
      ).to.be.rejectedWith(ActionNotAllowedException)
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
      expect(mockPrismaService.contestPublicizingRequest.delete.calledOnce).to
        .be.true
    })
  })

  describe('getContestPublicizingRequests', () => {
    it('should return requests for given contestId', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findMany.resolves(
        contestPublicizingRequests
      )

      //when
      const result = await contestService.getContestPublicizingRequests(
        contestId
      )

      //then
      expect(result).to.equal(contestPublicizingRequests)
    })
  })

  describe('getContestPublicizingRequest', () => {
    it('should return request for given id', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.resolves(
        contestPublicizingRequest
      )

      //when
      const result = await contestService.getContestPublicizingRequest(
        contestPublicizeRequestId
      )

      //then
      expect(result).to.equal(contestPublicizingRequest)
    })

    it('should throw error when request does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findFirst.rejects(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callGetContestPublicizingRequest = async () =>
        await contestService.getContestPublicizingRequest(
          contestPublicizeRequestId
        )

      //then
      await expect(callGetContestPublicizingRequest()).to.be.rejectedWith(
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
      mockPrismaService.contestPublicizingRequest.findUnique.resolves(
        contestPublicizingRequest
      )

      //when
      await contestService.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        respondContestPublicizingRequestDto
      )

      //then
      expect(mockPrismaService.contest.update.calledOnce).to.be.true
      expect(mockPrismaService.contestPublicizingRequest.update.calledOnce).to
        .be.true
    })

    it('should throw error when request for the contest does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.rejects(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callRespondContestPublicizingRequest = async () =>
        await contestService.respondContestPublicizingRequest(
          contestPublicizeRequestId,
          respondContestPublicizingRequestDto
        )

      //then
      await expect(callRespondContestPublicizingRequest()).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should update contest is_public as true when given request_status is Accepted', async () => {
      //given
      const updateContestToPublicSpy = spy(
        contestService,
        'updateContestToPublic'
      )
      mockPrismaService.contestPublicizingRequest.findUnique.resolves(
        contestPublicizingRequest
      )

      //when
      await contestService.respondContestPublicizingRequest(
        contestPublicizeRequestId,
        respondContestPublicizingRequestDto
      )

      //then
      expect(updateContestToPublicSpy.calledWith(contestId, true)).to.be.true
    })

    it('should update contest is_public as false when given request_status is Reject', async () => {
      //given
      const updateContestToPublicSpy = spy(
        contestService,
        'updateContestToPublic'
      )
      mockPrismaService.contestPublicizingRequest.findUnique.resolves(
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
      expect(updateContestToPublicSpy.calledWith(contestId, false)).to.be.true
    })
  })

  describe('getAdminContestPublicizingRequests', () => {
    it('should return requests for given where option', async () => {
      //given
      const whereOption = [RequestStatus.Pending]
      mockPrismaService.contestPublicizingRequest.findMany.resolves(
        contestPublicizingRequests
      )

      //when
      const result = await contestService.getAdminContestPublicizingRequests(
        whereOption
      )

      //then
      expect(result).to.equal(contestPublicizingRequests)
    })
  })

  describe('getAdminContestPublicizingRequest', () => {
    it('should return request for given contest id', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.resolves(
        contestPublicizingRequest
      )

      //when
      const result = await contestService.getAdminContestPublicizingRequest(
        contestPublicizeRequestId
      )

      //then
      expect(result).to.equal(contestPublicizingRequest)
    })

    it('should throw error when request for given contest id does not exist', async () => {
      //given
      mockPrismaService.contestPublicizingRequest.findUnique.rejects(
        new EntityNotExistException('ContestPublicizingRequest')
      )

      //when
      const callGetAdminContestPublicizingRequest = async () =>
        await contestService.getAdminContestPublicizingRequest(
          contestPublicizeRequestId
        )

      //then
      await expect(callGetAdminContestPublicizingRequest()).to.be.rejectedWith(
        EntityNotExistException
      )
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
        contestService.createContestRecord(userId, contestId)
      ).to.be.rejectedWith(EntityNotExistException, 'contest')
    })

    it('should throw error when user is participated in contest again', async () => {
      mockPrismaService.contestRecord.findFirst.resolves(record)
      await expect(
        contestService.createContestRecord(userId, contestId)
      ).to.be.rejectedWith(
        ActionNotAllowedException,
        'repetitive participation'
      )
    })
    it('should throw error when contest is not ongoing', async () => {
      mockPrismaService.contest.findUnique.resolves(contest)
      await expect(
        contestService.createContestRecord(userId, contestId)
      ).to.be.rejectedWith(ActionNotAllowedException, 'participation')
    })
    it('should successfully create contestRankACM', async () => {
      await contestService.createContestRecord(userId, contestId)
      expect(mockPrismaService.contestRankACM.create.calledOnce).to.be.true
    })
    // Todo: test other contest type -> create other contest record table
  })
})
