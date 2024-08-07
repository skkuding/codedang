import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  type Contest,
  type Group,
  type ContestRecord
} from '@prisma/client'
import { expect } from 'chai'
import * as dayjs from 'dayjs'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
import { ContestService, type ContestResult } from './contest.service'

const contestId = 1
const user01Id = 4
const groupId = 1

const now = dayjs()

const contest = {
  id: contestId,
  createdById: 1,
  groupId,
  title: 'title',
  description: 'description',
  startTime: now.add(-1, 'day').toDate(),
  endTime: now.add(1, 'day').toDate(),
  isVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  createTime: now.add(-1, 'day').toDate(),
  updateTime: now.add(-1, 'day').toDate(),
  group: {
    id: groupId,
    groupName: 'group'
  },
  invitationCode: '123456'
} satisfies Contest & {
  group: Partial<Group>
}

const ongoingContests = [
  {
    id: contest.id,
    group: contest.group,
    title: contest.title,
    invitationCode: 'test',
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<ContestResult>[]

const upcomingContests = [
  {
    id: contest.id + 6,
    group: contest.group,
    title: contest.title,
    invitationCode: 'test',
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<ContestResult>[]

const finishedContests = [
  {
    id: contest.id + 1,
    group: contest.group,
    title: contest.title,
    invitationCode: null,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<ContestResult>[]

const contests = [
  ...ongoingContests,
  ...finishedContests,
  ...upcomingContests
] satisfies Partial<ContestResult>[]

describe('ContestService', () => {
  let service: ContestService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        PrismaTestService,
        {
          provide: PrismaService,
          useExisting: PrismaTestService
        },
        ConfigService
      ]
    }).compile()

    service = module.get<ContestService>(ContestService)
    prisma = module.get<PrismaTestService>(PrismaTestService)
  })

  beforeEach(async () => {
    transaction = await prisma.$begin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).prisma = transaction
  })

  afterEach(async () => {
    await transaction.$rollback()
  })

  after(async () => {
    await prisma.$disconnect()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContestsByGroupId', () => {
    it('should return ongoing, upcoming contests when userId is undefined', async () => {
      const contests = await service.getContestsByGroupId(groupId)
      expect(contests.ongoing).to.have.lengthOf(4)
      expect(contests.upcoming).to.have.lengthOf(2)
    })

    it('a contest should contain following fields when userId is undefined', async () => {
      const contests = await service.getContestsByGroupId(groupId)
      expect(contests.ongoing[0]).to.have.property('title')
      expect(contests.ongoing[0]).to.have.property('startTime')
      expect(contests.ongoing[0]).to.have.property('endTime')
      expect(contests.ongoing[0]).to.have.property('participants')
      expect(contests.ongoing[0].group).to.have.property('id')
      expect(contests.ongoing[0].group).to.have.property('groupName')
      expect(contests.upcoming[0]).to.have.property('title')
      expect(contests.upcoming[0]).to.have.property('startTime')
      expect(contests.upcoming[0]).to.have.property('endTime')
      expect(contests.upcoming[0]).to.have.property('participants')
      expect(contests.upcoming[0].group).to.have.property('id')
      expect(contests.upcoming[0].group).to.have.property('groupName')
    })

    it('should return ongoing, upcoming, registered ongoing, registered upcoming contests when userId is provided', async () => {
      const contests = await service.getContestsByGroupId(groupId, user01Id)
      expect(contests.ongoing).to.have.lengthOf(2)
      expect(contests.upcoming).to.have.lengthOf(1)
      expect(contests.registeredOngoing).to.have.lengthOf(2)
      expect(contests.registeredUpcoming).to.have.lengthOf(2)
    })

    it('a contest should contain following fields when userId is provided', async () => {
      const contests = await service.getContestsByGroupId(groupId, user01Id)
      expect(contests.ongoing[0]).to.have.property('title')
      expect(contests.ongoing[0]).to.have.property('startTime')
      expect(contests.ongoing[0]).to.have.property('endTime')
      expect(contests.ongoing[0]).to.have.property('participants')
      expect(contests.ongoing[0].group).to.have.property('id')
      expect(contests.ongoing[0].group).to.have.property('groupName')
      expect(contests.upcoming[0]).to.have.property('title')
      expect(contests.upcoming[0]).to.have.property('startTime')
      expect(contests.upcoming[0]).to.have.property('endTime')
      expect(contests.upcoming[0]).to.have.property('participants')
      expect(contests.upcoming[0].group).to.have.property('id')
      expect(contests.upcoming[0].group).to.have.property('groupName')
      expect(contests.registeredOngoing[0]).to.have.property('title')
      expect(contests.registeredOngoing[0]).to.have.property('startTime')
      expect(contests.registeredOngoing[0]).to.have.property('endTime')
      expect(contests.registeredOngoing[0]).to.have.property('participants')
      expect(contests.registeredOngoing[0].group).to.have.property('id')
      expect(contests.registeredOngoing[0].group).to.have.property('groupName')
      expect(contests.registeredUpcoming[0]).to.have.property('title')
      expect(contests.registeredUpcoming[0]).to.have.property('startTime')
      expect(contests.registeredUpcoming[0]).to.have.property('endTime')
      expect(contests.registeredUpcoming[0]).to.have.property('participants')
      expect(contests.registeredUpcoming[0].group).to.have.property('id')
      expect(contests.registeredUpcoming[0].group).to.have.property('groupName')
    })
  })

  describe('getRegisteredOngoingUpcomingContests', () => {
    it('should return registeredOngoing, registeredUpcoming contests', async () => {
      const contests = await service.getRegisteredOngoingUpcomingContests(
        groupId,
        user01Id
      )
      expect(contests.registeredOngoing).to.have.lengthOf(2)
      expect(contests.registeredUpcoming).to.have.lengthOf(2)
    })

    it('a contest should contain following fields', async () => {
      const contests = await service.getRegisteredOngoingUpcomingContests(
        groupId,
        user01Id
      )
      expect(contests.registeredOngoing[0]).to.have.property('title')
      expect(contests.registeredOngoing[0]).to.have.property('startTime')
      expect(contests.registeredOngoing[0]).to.have.property('endTime')
      expect(contests.registeredOngoing[0]).to.have.property('participants')
      expect(contests.registeredOngoing[0].group).to.have.property('id')
      expect(contests.registeredOngoing[0].group).to.have.property('groupName')
      expect(contests.registeredUpcoming[0]).to.have.property('title')
      expect(contests.registeredUpcoming[0]).to.have.property('startTime')
      expect(contests.registeredUpcoming[0]).to.have.property('endTime')
      expect(contests.registeredUpcoming[0]).to.have.property('participants')
      expect(contests.registeredUpcoming[0].group).to.have.property('id')
      expect(contests.registeredUpcoming[0].group).to.have.property('groupName')
    })

    it("shold return contests whose title contains '신입생'", async () => {
      const keyword = '신입생'
      const contests = await service.getRegisteredOngoingUpcomingContests(
        groupId,
        user01Id,
        keyword
      )
      expect(
        contests.registeredOngoing.map((contest) => contest.title)
      ).to.deep.equals(['24년도 소프트웨어학과 신입생 입학 테스트2'])
    })
  })

  describe('getRegisteredContestIds', async () => {
    it("should return an array of contest's id user01 registered", async () => {
      const contestIds = await service.getRegisteredContestIds(user01Id)
      const registeredContestIds = [1, 3, 5, 7, 9, 11, 13, 15, 17]
      contestIds.sort((a, b) => a - b)
      expect(contestIds).to.deep.equal(registeredContestIds)
    })
  })

  describe('getRegisteredFinishedContests', async () => {
    it('should return only 2 contests that user01 registered but finished', async () => {
      const takeNum = 4
      const contests = await service.getRegisteredFinishedContests(
        null,
        takeNum,
        groupId,
        user01Id
      )
      expect(contests.data).to.have.lengthOf(takeNum)
    })

    it('should return a contest array which starts with id 9', async () => {
      const takeNum = 2
      const prevCursor = 11
      const contests = await service.getRegisteredFinishedContests(
        prevCursor,
        takeNum,
        groupId,
        user01Id
      )
      expect(contests.data[0].id).to.equals(9)
    })

    it('a contest should contain following fields', async () => {
      const contests = await service.getRegisteredFinishedContests(
        null,
        10,
        groupId,
        user01Id
      )
      expect(contests.data[0]).to.have.property('title')
      expect(contests.data[0]).to.have.property('startTime')
      expect(contests.data[0]).to.have.property('endTime')
      expect(contests.data[0]).to.have.property('participants')
      expect(contests.data[0].group).to.have.property('id')
      expect(contests.data[0].group).to.have.property('groupName')
    })

    it("shold return contests whose title contains '낮'", async () => {
      const keyword = '낮'
      const contests = await service.getRegisteredFinishedContests(
        null,
        10,
        groupId,
        user01Id,
        keyword
      )
      expect(contests.data.map((contest) => contest.title)).to.deep.equals([
        '소프트의 낮'
      ])
    })
  })

  describe('getFinishedContestsByGroupId', () => {
    it('should return finished contests', async () => {
      const contests = await service.getFinishedContestsByGroupId(
        null,
        10,
        groupId
      )
      const contestIds = contests.data.map((c) => c.id).sort((a, b) => a - b)
      const finishedContestIds = [6, 7, 8, 9, 10, 11, 12, 13]
      expect(contestIds).to.deep.equal(finishedContestIds)
    })
  })

  describe('filterOngoing', () => {
    it('should return ongoing contests of the group', () => {
      expect(service.filterOngoing(contests)).to.deep.equal(ongoingContests)
    })
  })

  describe('filterUpcoming', () => {
    it('should return upcoming contests of the group', () => {
      expect(service.filterUpcoming(contests)).to.deep.equal(upcomingContests)
    })
  })

  describe('getContest', () => {
    it('should throw error when contest does not exist', async () => {
      await expect(
        service.getContest(999, groupId, user01Id)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should return contest', async () => {
      expect(await service.getContest(contestId, groupId, user01Id)).to.be.ok
    })
  })

  describe('createContestRecord', () => {
    let contestRecordId = -1
    const invitationCode = '123456'
    const invalidInvitationCode = '000000'

    it('should throw error when the invitation code does not match', async () => {
      await expect(
        service.createContestRecord(1, user01Id, invalidInvitationCode)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when the contest does not exist', async () => {
      await expect(
        service.createContestRecord(999, user01Id, invitationCode)
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })

    it('should throw error when user is participated in contest again', async () => {
      await expect(
        service.createContestRecord(contestId, user01Id, invitationCode)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when contest is not ongoing', async () => {
      await expect(
        service.createContestRecord(8, user01Id, invitationCode)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should register to a contest successfully', async () => {
      const contestRecord = await service.createContestRecord(
        2,
        user01Id,
        invitationCode
      )
      contestRecordId = contestRecord.id
      expect(
        await transaction.contestRecord.findUnique({
          where: { id: contestRecordId }
        })
      ).to.deep.equals(contestRecord)
    })
  })

  describe('deleteContestRecord', () => {
    let contestRecord: ContestRecord | { id: number } = { id: -1 }

    afterEach(async () => {
      try {
        await transaction.contestRecord.delete({
          where: { id: contestRecord.id }
        })
      } catch (error) {
        if (
          !(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          )
        ) {
          throw error
        }
      }
    })

    it('should return deleted contest record', async () => {
      const newlyRegisteringContestId = 16
      contestRecord = await transaction.contestRecord.create({
        data: {
          contestId: newlyRegisteringContestId,
          userId: user01Id,
          acceptedProblemNum: 0,
          score: 0,
          totalPenalty: 0
        }
      })

      expect(
        await service.deleteContestRecord(newlyRegisteringContestId, user01Id)
      ).to.deep.equal(contestRecord)
    })

    it('should throw error when contest does not exist', async () => {
      await expect(
        service.deleteContestRecord(999, user01Id)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when contest record does not exist', async () => {
      await expect(
        service.deleteContestRecord(16, user01Id)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when contest is ongoing', async () => {
      await expect(
        service.deleteContestRecord(contestId, user01Id)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})
