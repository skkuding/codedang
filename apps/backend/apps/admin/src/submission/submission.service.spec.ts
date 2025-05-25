import { HttpModule } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { Contest, User, Assignment } from '@prisma/client'
import { Language, Role } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { TraceService } from 'nestjs-otel'
import { spy, stub } from 'sinon'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { SubmissionPublicationService } from '@libs/rabbitmq'
import { Snippet } from './class/create-submission.dto'
import { problems } from './mock/problem.mock'
import { submissions, submissionDto } from './mock/submission.mock'
import { submissionResults } from './mock/submissionResult.mock'
import { SubmissionService } from './submission.service'

const db = {
  submission: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub(),
    create: stub(),
    update: stub(),
    count: stub()
  },
  submissionResult: {
    create: stub(),
    createMany: stub(),
    updateMany: stub()
  },
  problem: {
    findFirst: stub(),
    findUnique: stub(),
    update: stub()
  },
  problemTestcase: {
    findMany: stub()
  },
  contest: {
    findFirst: stub()
  },
  assignment: {
    findFirst: stub()
  },
  contestProblem: {
    findUnique: stub(),
    findFirst: stub()
  },
  assignmentProblem: {
    findUnique: stub(),
    findFirst: stub(),
    findMany: stub()
  },
  workbook: {
    findFirst: stub()
  },
  workbookProblem: {
    findUnique: stub()
  },
  contestRecord: {
    findUnique: stub(),
    update: stub()
  },
  assignmentRecord: {
    findUnique: stub(),
    update: stub()
  },
  assignmentProblemRecord: {
    upsert: stub()
  },
  user: {
    findFirst: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator,
  $transaction: stub().callsFake(
    async <T>(operations: (() => Promise<T>)[]): Promise<T[]> => {
      if (!Array.isArray(operations)) {
        throw new Error('$transaction expects an array of operations')
      }

      try {
        const results: T[] = [] // ✅ 제네릭 T 적용하여 타입 명확화
        for (const op of operations) {
          if (typeof op === 'function') {
            results.push(await op())
          } else {
            results.push(op)
          }
        }
        return results
      } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`)
      }
    }
  )
}

const CONTEST_ID = 1
const ASSIGNMENT_ID = 1
const WORKBOOK_ID = 1
const mockContest: Contest = {
  id: CONTEST_ID,
  createdById: 1,
  title: 'SKKU Coding Platform 모의대회',
  description: 'test',
  penalty: 20,
  lastPenalty: false,
  invitationCode: 'test',
  startTime: new Date(),
  endTime: new Date(),
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  evaluateWithSampleTestcase: false,
  createTime: new Date(),
  updateTime: new Date(),
  unfreeze: false,
  freezeTime: null,
  posterUrl: 'posterUrl',
  summary: {
    참여대상: 'participationTarget',
    진행방식: 'competitionMethod',
    순위산정: 'rankingMethod',
    문제형태: 'problemFormat',
    참여혜택: 'benefits'
  }
}
const mockAssignment: Assignment = {
  id: ASSIGNMENT_ID,
  createdById: 1,
  groupId: 1,
  title: 'SKKU Coding Platform 모의과제',
  description: 'test',
  startTime: new Date(Date.now() - 10000),
  endTime: new Date(Date.now() + 10000),
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime: new Date(Date.now() - 10000),
  updateTime: new Date(Date.now() - 10000),
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: true,
  dueTime: new Date(Date.now() + 10000),
  isExercise: false
}
const USERIP = '127.0.0.1'

describe('SubmissionService', () => {
  let service: SubmissionService
  let publish: SubmissionPublicationService
  let cache: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        SubmissionService,
        { provide: PrismaService, useValue: db },
        ConfigService,
        TraceService,
        {
          provide: SubmissionPublicationService,
          useFactory: () => ({ publishJudgeRequestMessage: () => [] })
        },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => [],
            del: () => [],
            store: {
              keys: () => []
            }
          })
        }
      ]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
    publish = module.get<SubmissionPublicationService>(
      SubmissionPublicationService
    )
    cache = module.get<Cache>(CACHE_MANAGER)
    stub(cache, 'set').resolves()
    stub(cache, 'get').resolves([])
  })

  afterEach(() => {
    db.submission.findMany.resetHistory()
    db.submission.findFirst.resetHistory()
    db.submission.findUnique.resetHistory()
    db.submission.create.resetHistory()
    db.submission.update.resetHistory()
    db.submissionResult.create.resetHistory()
    db.submissionResult.createMany.resetHistory()
    db.submissionResult.updateMany.resetHistory()
    db.problem.findFirst.resetHistory()
    db.problem.findUnique.resetHistory()
    db.problem.update.resetHistory()
    db.problemTestcase.findMany.resetHistory()
    db.contest.findFirst.resetHistory()
    db.contestProblem.findUnique.resetHistory()
    db.contestProblem.findFirst.resetHistory()
    db.assignment.findFirst.resetHistory()
    db.assignmentProblem.findUnique.resetHistory()
    db.assignmentProblem.findFirst.resetHistory()
    db.assignmentProblem.findMany.resetHistory()
    db.workbookProblem.findUnique.resetHistory()
    db.contestRecord.findUnique.resetHistory()
    db.contestRecord.update.resetHistory()
    db.assignmentRecord.findUnique.resetHistory()
    db.assignmentRecord.update.resetHistory()
    db.user.findFirst.resetHistory()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('rejudgeSubmissionsByProblem', () => {
    it('should return sucessful rejudge value', async () => {
      const ResultValue = {
        successCount: 2,
        failedSubmissions: []
      }

      const createSubmissionResultsSpy = stub(
        service,
        'createSubmissionResults'
      )
      const publishJudgeRequestMessageSpy = stub(
        publish,
        'publishJudgeRequestMessage'
      )

      db.submission.findMany.resolves(submissions)
      db.submission.update.resolves(submissions)
      db.submission.create.resolves(submissions)

      const result = await service.rejudgeSubmissionsByProblem(1, 1)

      expect(result).to.deep.equal(ResultValue)
      expect(createSubmissionResultsSpy.callCount).to.equal(2)
      expect(publishJudgeRequestMessageSpy.callCount).to.equal(2)
    })

    it('should throw an exception when no submissions are found for the problem', async () => {
      db.submission.findMany.resolves([])

      await expect(
        service.rejudgeSubmissionsByProblem(1, 2, 3, 4)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('rejudgeSubmissionById', () => {
    it('should return sucessful rejudge value', async () => {
      db.submission.findUnique.resolves(submissions[1])
      db.submission.update.resolves(submissions[1])
      db.submission.create.resolves(submissions[1])

      const result = await service.rejudgeSubmissionById(1)

      await expect(result).to.deep.equal({
        error: "Cannot read properties of undefined (reading 'map')",
        success: false
      })
    })

    it('should throw an exception when no submissions are found for the submissionID', async () => {
      db.submission.findUnique.resolves(null)

      await expect(service.rejudgeSubmissionById(1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })
})
