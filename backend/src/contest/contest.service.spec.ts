import { Test, TestingModule } from '@nestjs/testing'
import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { stub } from 'sinon'
import {
  Contest,
  ContestRankACM,
  ContestRecord,
  ContestType,
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
import { UpdateContestDto } from './dto/update-contest.dto'

use(chaiAsPromised)

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
  startTime: new Date('2021-12-01T14:00:00.000+09:00'),
  endTime: new Date('2021-12-01T15:00:00.000+09:00'),
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
    endTime: new Date('2999-12-01T12:00:00.000+09:00'),
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
      use(chaiAsPromised)
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
        isGroupManager: false
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
      expect(await contestService.getContestsByGroupId(groupId)).to.deep.equal(
        contests
      )
    })
  })

  describe('getAdminContests', () => {
    it('should return contests in groups whose user is group manager', async () => {
      stub(groupService, 'getUserGroupManagerList').resolves([groupId])

      expect(await contestService.getAdminContests(userId)).to.deep.equal(
        contests
      )
    })
  })

  describe('getAdminOngoingContests', () => {
    it('should return ongoing contests in groups whose user is group manager', async () => {
      stub(groupService, 'getUserGroupManagerList').resolves([groupId])

      expect(
        await contestService.getAdminOngoingContests(userId)
      ).to.deep.equal(ongoingContests)
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
      expect(
        await contestService.getAdminContestsByGroupId(groupId)
      ).to.deep.equal(contests)
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
