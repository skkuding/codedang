import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  ContestRole,
  Prisma,
  QnACategory,
  type Contest,
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
import { ContestService } from './contest.service'

const contestId = 1
const user01Id = 7
const contestAdminId = 4

// const now = dayjs()

// const contest = {
//   id: contestId,
//   createdById: 1,
//   title: 'title',
//   description: 'description',
//   penalty: 100,
//   lastPenalty: false,
//   startTime: now.add(-1, 'day').toDate(),
//   endTime: now.add(1, 'day').toDate(),
//   registerDueTime: now.add(-2, 'day').toDate(),
//   unfreeze: false,
//   freezeTime: null,
//   isJudgeResultVisible: true,
//   enableCopyPaste: true,
//   evaluateWithSampleTestcase: false,
//   createTime: now.add(-1, 'day').toDate(),
//   updateTime: now.add(-1, 'day').toDate(),
//   posterUrl: 'posterUrl',
//   summary: {
//     참여대상: 'participationTarget',
//     진행방식: 'competitionMethod',
//     순위산정: 'rankingMethod',
//     문제형태: 'problemFormat',
//     참여혜택: 'benefits'
//   },
//   invitationCode: '123456'
// } satisfies Contest

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
      expect(contests.ongoing).to.have.lengthOf(6)
      expect(contests.upcoming).to.have.lengthOf(5)
      expect(contests.finished).to.have.lengthOf(9)
    })

    it('a contest should contain following fields when userId is undefined', async () => {
      const contests = await service.getContests()
      expect(contests.ongoing[0]).to.have.property('title')
      expect(contests.ongoing[0]).to.have.property('startTime')
      expect(contests.ongoing[0]).to.have.property('endTime')
      expect(contests.ongoing[0]).to.have.property('registerDueTime')
      expect(contests.ongoing[0]).to.have.property('participants')
      expect(contests.ongoing[0]).to.have.property('isRegistered')
      expect(contests.upcoming[0]).to.have.property('title')
      expect(contests.upcoming[0]).to.have.property('startTime')
      expect(contests.upcoming[0]).to.have.property('endTime')
      expect(contests.upcoming[0]).to.have.property('registerDueTime')
      expect(contests.upcoming[0]).to.have.property('participants')
      expect(contests.upcoming[0]).to.have.property('isRegistered')
      expect(contests.finished[0]).to.have.property('title')
      expect(contests.finished[0]).to.have.property('startTime')
      expect(contests.finished[0]).to.have.property('endTime')
      expect(contests.finished[0]).to.have.property('registerDueTime')
      expect(contests.finished[0]).to.have.property('participants')
      expect(contests.finished[0]).to.have.property('isRegistered')
    })

    it("should return contests whose title contains '신입생'", async () => {
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
      await expect(service.getContest(999, user01Id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should return contest', async () => {
      expect(await service.getContest(contestId, user01Id)).to.be.ok
    })

    it('should return optional fields if they exist', async () => {
      const contest = await service.getContest(contestId, user01Id)
      expect(contest).to.have.property('posterUrl')
      expect(contest).to.have.property('summary')
      if (contest.summary) {
        expect(contest.summary).to.have.property('참여대상')
        expect(contest.summary).to.have.property('진행방식')
        expect(contest.summary).to.have.property('순위산정')
        expect(contest.summary).to.have.property('문제형태')
        expect(contest.summary).to.have.property('참여혜택')
      }
    })

    it('should return prev and next contest information', async () => {
      const contest = await service.getContest(contestId, user01Id)
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

  describe('registerContest', () => {
    let contestRecordId = -1
    const invitationCode = '123456'
    const invalidInvitationCode = '000000'

    it('should throw error when the invitation code does not match', async () => {
      await expect(
        service.registerContest({
          contestId: 1,
          userId: user01Id,
          invitationCode: invalidInvitationCode
        })
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when the contest does not exist', async () => {
      await expect(
        service.registerContest({
          contestId: 999,
          userId: user01Id,
          invitationCode
        })
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })

    it('should throw error when user is participated in contest again', async () => {
      await expect(
        service.registerContest({
          contestId,
          userId: user01Id,
          invitationCode
        })
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when contest is not ongoing', async () => {
      await expect(
        service.registerContest({
          contestId: 8,
          userId: user01Id,
          invitationCode
        })
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should register to a contest successfully', async () => {
      const contestRecord = await service.registerContest({
        contestId: 16,
        userId: user01Id,
        invitationCode
      })
      contestRecordId = contestRecord.id
      expect(
        await transaction.contestRecord.findUnique({
          where: { id: contestRecordId }
        })
      ).to.deep.equals(contestRecord)
    })
  })

  describe('unregisterContest', () => {
    let contestRecord: ContestRecord | { id: number } = { id: -1 }

    it('should return deleted contest record', async () => {
      const newlyRegisteringContestId = 16
      await transaction.userContest.create({
        data: {
          contestId: newlyRegisteringContestId,
          userId: user01Id,
          role: ContestRole.Participant
        }
      })
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
        await service.unregisterContest(newlyRegisteringContestId, user01Id)
      ).to.deep.equal(contestRecord)
    })

    it('should throw error when contest does not exist', async () => {
      await expect(service.unregisterContest(999, user01Id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when contest record does not exist', async () => {
      await expect(service.unregisterContest(16, user01Id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when contest is ongoing', async () => {
      await expect(
        service.unregisterContest(contestId, user01Id)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getContestLeaderboard', () => {
    it('should return leaderboard of the contest', async () => {
      const leaderboard = await service.getContestLeaderboard(
        contestId,
        contestAdminId
      )
      expect(leaderboard).to.be.ok
    })
  })

  describe('getContestRoles', () => {
    it('should return contest roles', async () => {
      const roles = await service.getContestRoles(contestAdminId)
      expect(roles).to.be.an('array')
      expect(roles[0]).to.have.property('contestId')
      expect(roles[0]).to.have.property('role')
    })
  })

  describe('createContestQnA', () => {
    it('should create General QnA', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA general title', content: 'QnA general content' },
        undefined
      )
      expect(created).to.have.property('id')
      expect(created).to.have.property('order')
      expect(created.title).to.equal('QnA general title')
      expect(created.content).to.equal('QnA general content')
      expect(created.contestId).to.equal(contestId)
      expect(created.createdById).to.equal(user01Id)
      expect(created.category).to.equal(QnACategory.General)
      expect(created.readBy).to.include(user01Id)
    })

    it('should throw when contest does not exist', async () => {
      await expect(
        service.createContestQnA(
          99,
          user01Id,
          { title: 'QnA title', content: 'QnA content' },
          undefined
        )
      ).to.be.rejected
    })

    it('should forbid creating during contest if user is not registered', async () => {
      await expect(
        service.createContestQnA(
          contestId,
          99,
          { title: 'QnA title', content: 'QnA content' },
          undefined
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getContestQnAs', () => {
    it('should return QnA list', async () => {
      const list = await service.getContestQnAs(user01Id, contestId, {})
      expect(list).to.be.an('array')
    })

    it('should support category filter', async () => {
      const list = await service.getContestQnAs(user01Id, contestId, {
        categories: [QnACategory.General]
      })
      expect(list).to.be.an('array')
    })
  })

  describe('getContestQnA', () => {
    let createdOrder: number

    beforeEach(async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      createdOrder = created.order
    })

    it('should allow own QnA during contest', async () => {
      const qna = await service.getContestQnA(user01Id, contestId, createdOrder)
      expect(qna).to.have.property('id')
      expect(qna.order).to.equal(createdOrder)
    })

    it('should forbid non-writer non-staff during contest', async () => {
      await expect(
        service.getContestQnA(99, contestId, createdOrder)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('deleteContestQnA', () => {
    it('writer can delete own QnA', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      const deleted = await service.deleteContestQnA(
        user01Id,
        contestId,
        created.order
      )
      expect(deleted.id).to.equal(created.id)
    })

    it('non-writer non-staff cannot delete QnA', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      await expect(
        service.deleteContestQnA(999, contestId, created.order)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('createContestQnAComment', () => {
    it('should allow to create comment to own QnA during contest', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      const comment = await service.createContestQnAComment(
        user01Id,
        contestId,
        created.order,
        'QnA comment'
      )
      expect(comment).to.have.property('id')
    })

    it('forbid non-privileged comment during contest', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      await expect(
        service.createContestQnAComment(99, contestId, created.order, 'comment')
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('deleteContestQnAComment', () => {
    it('writer can delete own comment', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      const comment = await service.createContestQnAComment(
        user01Id,
        contestId,
        created.order,
        'comment'
      )
      const deleted = await service.deleteContestQnAComment(
        user01Id,
        contestId,
        created.order,
        comment.order
      )
      expect(deleted.id).to.equal(comment.id)
    })

    it('non-writer non-staff cannot delete comment', async () => {
      const created = await service.createContestQnA(
        contestId,
        user01Id,
        { title: 'QnA title', content: 'QnA content' },
        undefined
      )
      const comment = await service.createContestQnAComment(
        user01Id,
        contestId,
        created.order,
        'comment'
      )
      await expect(
        service.deleteContestQnAComment(
          99,
          contestId,
          created.order,
          comment.order
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})
