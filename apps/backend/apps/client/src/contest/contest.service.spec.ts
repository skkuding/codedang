import { CACHE_MANAGER } from '@nestjs/cache-manager'
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
  penalty: 100,
  lastPenalty: false,
  startTime: now.add(-1, 'day').toDate(),
  endTime: now.add(1, 'day').toDate(),
  freezeTime: null,
  isVisible: true,
  isJudgeResultVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  createTime: now.add(-1, 'day').toDate(),
  updateTime: now.add(-1, 'day').toDate(),
  group: {
    id: groupId,
    groupName: 'group'
  },
  posterUrl: 'posterUrl',
  participationTarget: 'participationTarget',
  competitionMethod: 'competitionMethod',
  rankingMethod: 'rankingMethod',
  problemFormat: 'problemFormat',
  benefits: 'benefits',
  invitationCode: '123456'
} satisfies Contest & {
  group: Partial<Group>
}

const ongoingContests = [
  {
    id: contest.id,
    group: contest.group,
    title: contest.title,
    posterUrl: contest.posterUrl,
    participationTarget: contest.participationTarget,
    competitionMethod: contest.competitionMethod,
    rankingMethod: contest.rankingMethod,
    problemFormat: contest.problemFormat,
    benefits: contest.benefits,
    invitationCode: 'test',
    isJudgeResultVisible: true,
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true,
    contestProblem: []
  }
] satisfies Partial<ContestResult>[]

const upcomingContests = [
  {
    id: contest.id + 6,
    group: contest.group,
    title: contest.title,
    posterUrl: null,
    participationTarget: null,
    competitionMethod: null,
    rankingMethod: contest.rankingMethod,
    problemFormat: contest.problemFormat,
    benefits: contest.benefits,
    invitationCode: 'test',
    isJudgeResultVisible: true,
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true,
    contestProblem: []
  }
] satisfies Partial<ContestResult>[]

const finishedContests = [
  {
    id: contest.id + 1,
    group: contest.group,
    title: contest.title,
    posterUrl: contest.posterUrl,
    participationTarget: contest.participationTarget,
    competitionMethod: contest.competitionMethod,
    rankingMethod: null,
    problemFormat: null,
    benefits: null,
    invitationCode: null,
    isJudgeResultVisible: true,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true,
    contestProblem: []
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
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        }
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

  describe('getContests', () => {
    it('should return ongoing, upcoming contests when userId is undefined', async () => {
      const contests = await service.getContests()
      expect(contests.ongoing).to.have.lengthOf(5)
      expect(contests.upcoming).to.have.lengthOf(4)
      expect(contests.finished).to.have.lengthOf(9)
    })

    it('a contest should contain following fields when userId is undefined', async () => {
      const contests = await service.getContests(groupId)
      expect(contests.ongoing[0]).to.have.property('title')
      expect(contests.ongoing[0]).to.have.property('startTime')
      expect(contests.ongoing[0]).to.have.property('endTime')
      expect(contests.ongoing[0]).to.have.property('participants')
      expect(contests.ongoing[0]).to.have.property('isRegistered')
      expect(contests.upcoming[0]).to.have.property('title')
      expect(contests.upcoming[0]).to.have.property('startTime')
      expect(contests.upcoming[0]).to.have.property('endTime')
      expect(contests.upcoming[0]).to.have.property('participants')
      expect(contests.upcoming[0]).to.have.property('isRegistered')
      expect(contests.finished[0]).to.have.property('title')
      expect(contests.finished[0]).to.have.property('startTime')
      expect(contests.finished[0]).to.have.property('endTime')
      expect(contests.finished[0]).to.have.property('participants')
      expect(contests.finished[0]).to.have.property('isRegistered')
    })

    it("shold return contests whose title contains '신입생'", async () => {
      const keyword = '신입생'
      const contests = await service.getContests(user01Id, keyword)

      expect(contests.ongoing.map((contest) => contest.title)).to.deep.equals([
        '24년도 소프트웨어학과 신입생 입학 테스트2',
        '24년도 소프트웨어학과 신입생 입학 테스트1',
        '24년도 소프트웨어학과 신입생 입학 테스트3'
      ])
    })
  })

  describe('getBannerContests', () => {
    it('should return banner contests', async () => {
      const bannerContests = await service.getBannerContests()
      expect(bannerContests).to.have.property('fastestUpcomingContestId')
      expect(bannerContests).to.have.property('mostRegisteredId')
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

    it('should return optional fields if they exist', async () => {
      expect(contest).to.have.property('posterUrl')
      expect(contest).to.have.property('participationTarget')
      expect(contest).to.have.property('competitionMethod')
      expect(contest).to.have.property('rankingMethod')
      expect(contest).to.have.property('problemFormat')
      expect(contest).to.have.property('benefits')
    })

    it('should return prev and next contest information', async () => {
      const contest = await service.getContest(contestId, groupId, user01Id)
      if (contest.prev) {
        expect(contest.prev).to.have.property('id')
        expect(contest.prev.id).to.be.lessThan(contestId)
        expect(contest.prev).to.have.property('title')
      }
      if (contest.next) {
        expect(contest.next).to.have.property('id')
        expect(contest.next.id).to.be.greaterThan(contestId)
        expect(contest.next).to.have.property('title')
      }
    })
  })

  describe('createContestRecord', () => {
    let contestRecordId = -1
    const invitationCode = '123456'
    const invalidInvitationCode = '000000'

    it('should throw error when the invitation code does not match', async () => {
      await expect(
        service.createContestRecord({
          contestId: 1,
          userId: user01Id,
          invitationCode: invalidInvitationCode
        })
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when the contest does not exist', async () => {
      await expect(
        service.createContestRecord({
          contestId: 999,
          userId: user01Id,
          invitationCode: invitationCode
        })
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })

    it('should throw error when user is participated in contest again', async () => {
      await expect(
        service.createContestRecord({
          contestId: contestId,
          userId: user01Id,
          invitationCode: invitationCode
        })
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when contest is not ongoing', async () => {
      await expect(
        service.createContestRecord({
          contestId: 8,
          userId: user01Id,
          invitationCode: invitationCode
        })
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should register to a contest successfully', async () => {
      const contestRecord = await service.createContestRecord({
        contestId: 2,
        userId: user01Id,
        invitationCode: invitationCode
      })
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

  describe('getContestLeaderboard', () => {
    it('should return leaderboard of the contest', async () => {
      const leaderboard = await service.getContestLeaderboard(
        user01Id,
        contestId
      )
      expect(leaderboard).to.be.ok
    })
  })
})
