import { HttpModule } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { Contest, User, Assignment } from '@prisma/client'
import { Language, Prisma, ResultStatus, Role } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { TraceService } from 'nestjs-otel'
import { spy, stub, type SinonStub } from 'sinon'
import { PERCENTAGE_SCALE } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Snippet } from '../class/create-submission.dto'
import { problems } from '../mock/problem.mock'
import { submissions, submissionDto } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
import { SubmissionFinalizationService } from '../submission-finalization.service'
import { SubmissionPublicationService } from '../submission-pub.service'
import { SubmissionService } from '../submission.service'

const db = {
  submission: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
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
    findUnique: stub(),
    findFirst: stub()
  },
  assignment: {
    findFirst: stub(),
    findUnique: stub()
  },
  userGroup: {
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
    upsert: stub(),
    findUnique: stub(),
    update: stub()
  },
  userContest: {
    findFirst: stub(),
    findUnique: stub()
  },
  assignmentRecord: {
    upsert: stub(),
    findUnique: stub(),
    update: stub()
  },
  assignmentProblemRecord: {
    upsert: stub()
  },
  user: {
    findFirst: stub()
  },
  $transaction: async <T>(fn: (prisma: typeof db) => Promise<T>): Promise<T> =>
    fn(db),
  getPaginator: PrismaService.prototype.getPaginator
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
  registerDueTime: new Date(),
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
  dueTime: new Date(Date.now() + 5000),
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime: new Date(Date.now() - 10000),
  updateTime: new Date(Date.now() - 10000),
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: true,
  isExercise: false
}
const USERIP = '127.0.0.1'

describe('SubmissionService', () => {
  let service: SubmissionService
  let publish: SubmissionPublicationService
  let finalization: SubmissionFinalizationService
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
          provide: SubmissionFinalizationService,
          useFactory: () => ({
            finalizeSubmission: stub(),
            applyFinalizationEffects: stub()
          })
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
    finalization = module.get<SubmissionFinalizationService>(
      SubmissionFinalizationService
    )
    cache = module.get<Cache>(CACHE_MANAGER)
    stub(cache, 'set').resolves()
    stub(cache, 'get').resolves([])
  })

  afterEach(() => {
    for (const model of Object.values(db)) {
      if (model && typeof model === 'object') {
        for (const method of Object.values(model) as SinonStub[]) {
          method.reset()
        }
      }
    }
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('submitToProblem', () => {
    it('should call createSubmission', async () => {
      db.problem.findFirst.resolves(problems[0])
      const createSpy = stub(service, 'createSubmission')

      await service.submitToProblem({
        submissionDto,
        userIp: USERIP,
        userId: submissions[0].userId,
        problemId: problems[0].id
      })
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if problem is not found', async () => {
      db.problem.findFirst.resolves(null)
      const createSpy = stub(service, 'createSubmission')

      await expect(
        service.submitToProblem({
          submissionDto,
          userIp: USERIP,
          userId: submissions[0].userId,
          problemId: problems[0].id
        })
      ).to.be.rejectedWith(EntityNotExistException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('submitToContest', () => {
    it('should call createSubmission', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.contest.findFirst.resolves({
        ...mockContest,
        startTime: new Date(Date.now() - 10000),
        endTime: new Date(Date.now() + 10000)
      })
      db.userContest.findUnique.resolves({
        id: 1,
        userId: submissions[0].userId,
        contestId: CONTEST_ID,
        role: 'participant'
      })
      db.contestProblem.findUnique.resolves({ problem: problems[0] })

      await service.submitToContest({
        submissionDto,
        userIp: USERIP,
        userId: submissions[0].userId,
        problemId: problems[0].id,
        contestId: CONTEST_ID
      })
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if contest is not ongoing', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.contest.findFirst.resolves(null)

      await expect(
        service.submitToContest({
          submissionDto,
          userIp: USERIP,
          userId: submissions[0].userId,
          problemId: problems[0].id,
          contestId: CONTEST_ID
        })
      ).to.be.rejectedWith(EntityNotExistException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('submitToAssignment', () => {
    it('should call createSubmission', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.assignment.findFirst.resolves(mockAssignment)
      db.userGroup.findFirst.resolves({ isGroupLeader: false })
      db.assignmentRecord.findUnique.resolves({
        id: 1,
        assignment: {
          groupId: 1,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() + 10000),
          dueTime: new Date(Date.now() + 5000)
        }
      })
      db.assignmentProblem.findUnique.resolves({ problem: problems[0] })

      await service.submitToAssignment({
        submissionDto,
        userIp: USERIP,
        userId: submissions[0].userId,
        problemId: problems[0].id,
        assignmentId: ASSIGNMENT_ID
      })
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if assignment is not ongoing', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.assignment.findFirst.resolves(null)

      await expect(
        service.submitToAssignment({
          submissionDto,
          userIp: USERIP,
          userId: submissions[0].userId,
          problemId: problems[0].id,
          assignmentId: ASSIGNMENT_ID
        })
      ).to.be.rejectedWith(EntityNotExistException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('submitToWorkbook', () => {
    it('should call createSubmission', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.workbookProblem.findUnique.resolves({ problem: problems[0] })

      await service.submitToWorkbook({
        submissionDto,
        userIp: USERIP,
        userId: submissions[0].userId,
        problemId: problems[0].id,
        workbookId: WORKBOOK_ID
      })
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if groupId does not match or problem is not exposed', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.workbookProblem.findUnique.resolves(null)

      await expect(
        service.submitToWorkbook({
          submissionDto,
          userIp: USERIP,
          userId: submissions[0].userId,
          problemId: problems[0].id,
          workbookId: WORKBOOK_ID
        })
      ).to.be.rejectedWith(EntityNotExistException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('createSubmission', () => {
    it('should create submission', async () => {
      const judgeableTestcases = [{ id: 1, isHidden: false }]
      const getJudgeableStub = stub(service, 'getJudgeableTestcases').resolves(
        judgeableTestcases
      )
      const createSpy = stub(service, 'createSubmissionResults')
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.submission.create.resolves(submissions[0])

      expect(
        await service.createSubmission({
          submissionDto,
          problem: problems[0],
          userId: submissions[0].userId,
          userIp: USERIP
        })
      ).to.deep.equal(submissions[0])
      expect(getJudgeableStub.calledOnceWith(problems[0].id, false)).to.be.true
      expect(createSpy.calledOnceWith(submissions[0], judgeableTestcases)).to.be
        .true
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should create the submission without testcases when no testcase is judgeable', async () => {
      const finalizedSubmission = {
        ...submissions[0],
        codeSize: 1000,
        contestId: CONTEST_ID,
        result: ResultStatus.Accepted,
        score: new Prisma.Decimal(PERCENTAGE_SCALE)
      }

      const getJudgeableStub = stub(service, 'getJudgeableTestcases').resolves(
        []
      )
      const createResultsStub = stub(service, 'createSubmissionResults')
      const createWithoutTestcasesStub = stub(
        service,
        'createSubmissionWithoutTestcases'
      ).resolves(finalizedSubmission)
      const publishStub = stub(publish, 'publishJudgeRequestMessage')

      const result = await service.createSubmission({
        submissionDto,
        problem: problems[0],
        userId: submissions[0].userId,
        userIp: USERIP,
        idOptions: {
          contestId: CONTEST_ID
        },
        judgeOnlyHiddenTestcases: true
      })

      expect(getJudgeableStub.calledOnceWith(problems[0].id, true)).to.be.true
      expect(createResultsStub.called).to.be.false
      expect(db.submission.create.called).to.be.false
      expect(createWithoutTestcasesStub.calledOnce).to.be.true
      expect(createWithoutTestcasesStub.firstCall.args[0]).to.deep.include({
        userId: submissions[0].userId,
        userIp: USERIP,
        problemId: problems[0].id
      })
      expect(createWithoutTestcasesStub.firstCall.args[1]).to.deep.equal({
        contestId: CONTEST_ID
      })
      expect(publishStub.called).to.be.false
      expect(result).to.deep.equal(finalizedSubmission)
    })

    it('should create submission with contestId', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves({
        ...submissions[0],
        contestId: CONTEST_ID
      })
      db.problemTestcase.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])

      expect(
        await service.createSubmission({
          submissionDto,
          problem: problems[0],
          userId: submissions[0].userId,
          userIp: USERIP,
          idOptions: { contestId: CONTEST_ID }
        })
      ).to.be.deep.equal({ ...submissions[0], contestId: CONTEST_ID })
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should create submission with assignmentId', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves({
        ...submissions[0],
        assignmentId: ASSIGNMENT_ID
      })
      db.problemTestcase.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])

      expect(
        await service.createSubmission({
          submissionDto,
          problem: problems[0],
          userId: submissions[0].userId,
          userIp: USERIP,
          idOptions: { assignmentId: ASSIGNMENT_ID }
        })
      ).to.be.deep.equal({ ...submissions[0], assignmentId: ASSIGNMENT_ID })
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should create submission with workbookId', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves({
        ...submissions[0],
        workbookId: WORKBOOK_ID
      })
      db.problemTestcase.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])
      expect(
        await service.createSubmission({
          submissionDto,
          problem: problems[0],
          userId: submissions[0].userId,
          userIp: USERIP,
          idOptions: { workbookId: WORKBOOK_ID }
        })
      ).to.be.deep.equal({ ...submissions[0], workbookId: WORKBOOK_ID })
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should throw exception if the language is not supported', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')

      await expect(
        service.createSubmission({
          submissionDto: { ...submissionDto, language: Language.Python3 },
          problem: problems[0],
          userId: submissions[0].userId,
          userIp: USERIP
        })
      ).to.be.rejectedWith(ConflictFoundException)
      expect(publishSpy.calledOnce).to.be.false
    })

    it('should throw error if locked code is modified', async () => {
      const validateSpy = spy(service, 'isValidCode')
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')

      await expect(
        service.createSubmission({
          submissionDto: {
            ...submissionDto,
            code: plainToInstance(Snippet, submissions[1].code)
          },
          problem: problems[0],
          userId: submissions[0].userId,
          userIp: USERIP
        })
      ).to.be.rejectedWith(ConflictFoundException)
      expect(validateSpy.returnValues[0]).to.be.false
      expect(publishSpy.calledOnce).to.be.false
    })
  })

  describe('createSubmissionWithoutTestcases', () => {
    it('should create the submission as Accepted and apply finalization effects without a prior update', async () => {
      const submissionData = {
        code: submissions[0].code,
        language: submissions[0].language,
        userId: submissions[0].userId,
        userIp: USERIP,
        problemId: problems[0].id,
        codeSize: 1000
      }
      const createdSubmission = {
        ...submissions[0],
        ...submissionData,
        contestId: CONTEST_ID,
        result: ResultStatus.Accepted,
        score: new Prisma.Decimal(PERCENTAGE_SCALE)
      }

      db.submission.create.resolves(createdSubmission)
      const applyEffectsStub =
        finalization.applyFinalizationEffects as SinonStub

      const result = await service.createSubmissionWithoutTestcases(
        submissionData,
        { contestId: CONTEST_ID }
      )

      expect(
        db.submission.create.calledOnceWith({
          data: {
            ...submissionData,
            result: ResultStatus.Accepted,
            score: PERCENTAGE_SCALE,
            contestId: CONTEST_ID,
            assignmentId: undefined,
            workbookId: undefined
          }
        })
      ).to.be.true
      expect(applyEffectsStub.calledOnceWithExactly(createdSubmission, true)).to
        .be.true
      expect(result).to.deep.equal(createdSubmission)
    })
  })

  describe('getSubmissions', () => {
    it('should return submissions', async () => {
      db.problem.findFirst.resolves(problems[0])
      db.submission.findMany.resolves(submissions)
      db.submission.count.resolves(1)

      expect(
        await service.getSubmissions({ problemId: problems[0].id })
      ).to.deep.equal({ data: submissions, total: 1 })
    })

    it('should throw not found error', async () => {
      db.problem.findFirst.resolves(null)

      await expect(
        service.getSubmissions({ problemId: problems[0].id })
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getSubmission', () => {
    it('should return submission', async () => {
      const testcaseResult = submissionResults.map((result) => {
        return {
          ...result,
          cpuTime:
            result.cpuTime || result.cpuTime === BigInt(0)
              ? result.cpuTime.toString()
              : null
        }
      })

      db.problem.findFirst.resolves(problems[0])
      db.submission.findFirst.resolves({
        ...submissions[0],
        user: { username: 'username' },
        submissionResult: submissionResults
      })
      db.user.findFirst.resolves({
        username: 'username',
        id: submissions[0].userId,
        role: Role.User
      })

      expect(
        await service.getSubmission({
          id: submissions[0].id,
          problemId: problems[0].id,
          userId: submissions[0].userId,
          userRole: Role.User,
          contestId: null,
          assignmentId: null
        })
      ).to.deep.equal({
        problemId: problems[0].id,
        username: 'username',
        code: submissions[0].code.map((snippet) => snippet.text).join('\n'),
        language: submissions[0].language,
        createTime: submissions[0].createTime,
        result: submissions[0].result,
        testcaseResult
      })
    })

    it('should throw exception if problem is not found', async () => {
      db.problem.findFirst.resolves(null)

      await expect(
        service.getSubmission({
          id: submissions[0].id,
          problemId: problems[0].id,
          userId: submissions[0].userId,
          userRole: Role.User,
          contestId: null,
          assignmentId: null
        })
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw exception if submission is not found', async () => {
      db.problem.findFirst.resolves(problems[0])
      db.submission.findFirst.resolves(null)

      await expect(
        service.getSubmission({
          id: submissions[0].id,
          problemId: problems[0].id,
          userId: submissions[0].userId,
          userRole: Role.User,
          contestId: null,
          assignmentId: null
        })
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it("should throw exception if submission is not user's and user has not passed this problem", async () => {
      db.problem.findFirst.resolves(problems[0])
      db.submission.findFirst.resolves({ ...submissions[0], userId: 2 })
      db.submission.count.resolves(0)

      await expect(
        service.getSubmission({
          id: submissions[0].id,
          problemId: problems[0].id,
          userId: submissions[0].userId,
          userRole: Role.User,
          contestId: null,
          assignmentId: null
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw exception when trying to view others submission during a contest', async () => {
      const ongoingContest = {
        ...mockContest,
        startTime: new Date(Date.now() - 10000),
        endTime: new Date(Date.now() + 10000)
      }
      db.userContest.findUnique.resolves({})
      db.contest.findUnique.resolves(ongoingContest)
      db.problem.findFirst.resolves(problems[0])
      db.submission.findFirst.resolves({
        ...submissions[0],
        userId: 2
      })

      await expect(
        service.getSubmission({
          id: submissions[0].id,
          problemId: problems[0].id,
          userId: 1,
          userRole: Role.User,
          contestId: CONTEST_ID,
          assignmentId: null
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should return submission for group leader without assignment record', async () => {
      db.assignment.findUnique.resolves({
        groupId: mockAssignment.groupId,
        startTime: mockAssignment.startTime,
        endTime: mockAssignment.endTime,
        isJudgeResultVisible: mockAssignment.isJudgeResultVisible
      })
      db.userGroup.findFirst.resolves({ userId: 1, isGroupLeader: true })
      db.problem.findFirst.resolves(problems[0])
      db.submission.findFirst.resolves({
        ...submissions[0],
        userId: 2,
        user: { username: 'student' },
        submissionResult: []
      })

      const result = await service.getSubmission({
        id: submissions[0].id,
        problemId: problems[0].id,
        userId: 1,
        userRole: Role.User,
        contestId: null,
        assignmentId: ASSIGNMENT_ID
      })

      expect(result.username).to.equal('student')
      expect(db.assignmentRecord.findUnique.called).to.be.false
    })
  })

  describe('getContestSubmissions', () => {
    it('should return submissions', async () => {
      const adminUser: User = {
        id: 1,
        username: 'username',
        password: '1234',
        role: 'Admin',
        email: 'test@test.com',
        lastLogin: new Date(),
        createTime: new Date(),
        updateTime: new Date(),
        studentId: '2020000000',
        college: null,
        major: null,
        canCreateCourse: false,
        canCreateContest: false
      }
      db.user.findFirst.resolves(adminUser)
      db.contestRecord.findUnique.resolves({})
      db.contestProblem.findFirst.resolves({})
      db.submission.findMany.resolves(submissions)
      db.submission.count.resolves(1)
      db.contest.findFirst.resolves({ isJudgeResultVisible: true })

      expect(
        await service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: CONTEST_ID,
          userId: submissions[0].userId
        })
      ).to.deep.equal({ data: submissions, total: 1 })
    })

    it('should throw exception if user is not registered to contest', async () => {
      db.user.findFirst.resolves(null)
      db.contestRecord.findUnique.resolves({})
      db.userContest.findUnique.resolves(null)

      await expect(
        service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: CONTEST_ID,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it("should throw exception if contest doesn't have this problem", async () => {
      db.user.findFirst.resolves({})
      db.contestRecord.findUnique.resolves({})
      db.contestProblem.findFirst.resolves(null)

      await expect(
        service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: CONTEST_ID,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getAssignmentSubmissions', () => {
    it('should return submissions', async () => {
      const adminUser: User = {
        id: 1,
        username: 'username',
        password: '1234',
        role: 'Admin',
        email: 'test@test.com',
        lastLogin: new Date(),
        createTime: new Date(),
        updateTime: new Date(),
        studentId: '2020000000',
        college: null,
        major: null,
        canCreateCourse: false,
        canCreateContest: false
      }
      db.user.findFirst.resolves(adminUser)
      db.assignmentRecord.findUnique.resolves()
      const assignmentProblem = {
        order: 0,
        problem: {
          id: 7,
          title: '천재 디자이너'
        },
        assignment: {
          id: 19,
          isJudgeResultVisible: true,
          title: '24학년도 성민규 과제'
        }
      }
      db.assignmentProblem.findFirst.resolves(assignmentProblem)
      db.submission.findMany.resolves(submissions)
      db.submission.count.resolves(1)

      expect(
        await service.getAssignmentSubmissions({
          problemId: problems[0].id,
          assignmentId: ASSIGNMENT_ID,
          userId: submissions[0].userId
        })
      ).to.deep.equal({ data: submissions, total: 1, assignmentProblem })
    })

    it('should throw exception if user is not registered to assignment', async () => {
      db.user.findFirst.resolves(null)
      db.assignmentRecord.findUnique.resolves({})
      db.assignment.findUnique.resolves(mockAssignment)
      db.userGroup.findFirst.resolves(null)

      await expect(
        service.getAssignmentSubmissions({
          problemId: problems[0].id,
          assignmentId: ASSIGNMENT_ID,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it("should throw exception if assignment doesn't have this problem", async () => {
      db.user.findFirst.resolves({})
      db.assignmentRecord.findUnique.resolves({})
      db.assignmentProblem.findFirst.resolves(null)

      await expect(
        service.getAssignmentSubmissions({
          problemId: problems[0].id,
          assignmentId: ASSIGNMENT_ID,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
  describe('getAssignmentSubmissionSummary', () => {
    it('should return submission summary for assignment problems', async () => {
      const assignmentId = 1
      const userId = 1
      const mockAssignmentProblems = [{ problemId: 1 }, { problemId: 2 }]
      const mockSubmissions = [
        {
          problemId: 1,
          createTime: new Date(),
          result: 'Accepted',
          submissionResult: [
            { result: 'Accepted' },
            { result: 'Accepted' },
            { result: 'Wrong Answer' }
          ]
        }
      ]

      db.assignment.findUnique.resolves(mockAssignment)
      db.userGroup.findFirst.resolves({ isGroupLeader: false })
      db.assignmentRecord.findUnique.resolves(null)
      db.assignmentProblem.findMany.resolves(mockAssignmentProblems)
      db.submission.findMany.resolves(mockSubmissions)

      const result = await service.getAssignmentSubmissionSummary(
        assignmentId,
        userId
      )

      expect(result).to.have.lengthOf(2)
      expect(result[0].problemId).to.equal(1)
      expect(result[0].submission).to.not.be.null
      expect(result[0].submission?.submissionResult).to.equal('Accepted')
      expect(result[0].submission?.testcaseCount).to.equal(3)
      expect(result[0].submission?.acceptedTestcaseCount).to.equal(2)

      expect(result[1].problemId).to.equal(2)
      expect(result[1].submission).to.be.null

      expect(db.assignmentRecord.findUnique.called).to.be.false
      expect(db.assignmentProblem.findMany.calledOnce).to.be.true
      expect(db.submission.findMany.calledOnce).to.be.true
    })

    it('should return empty array when there are no assignment problems', async () => {
      const assignmentId = 1
      const userId = 1

      db.assignment.findUnique.resolves(mockAssignment)
      db.userGroup.findFirst.resolves({ isGroupLeader: false })
      db.assignmentRecord.findUnique.resolves(null)
      db.assignmentProblem.findMany.resolves([])

      const result = await service.getAssignmentSubmissionSummary(
        assignmentId,
        userId
      )

      expect(result).to.be.an('array').that.is.empty

      expect(db.assignmentRecord.findUnique.called).to.be.false
      expect(db.assignmentProblem.findMany.calledOnce).to.be.true
      expect(db.submission.findMany.called).to.be.false
    })

    it('should throw ForbiddenAccessException when user is not participating in assignment', async () => {
      const assignmentId = 1
      const userId = 1

      db.assignmentRecord.findUnique.resolves({})
      db.assignment.findUnique.resolves(mockAssignment)
      db.userGroup.findFirst.resolves(null)

      await expect(
        service.getAssignmentSubmissionSummary(assignmentId, userId)
      ).to.be.rejectedWith(
        ForbiddenAccessException,
        'User not participated in the assignment'
      )

      expect(db.assignmentRecord.findUnique.called).to.be.false
      expect(db.assignmentProblem.findMany.called).to.be.false
    })

    it('should handle multiple submissions for the same problem and use the most recent one', async () => {
      const assignmentId = 1
      const userId = 1
      const mockAssignmentProblems = [{ problemId: 1 }]
      const olderDate = new Date('2023-01-01')
      const newerDate = new Date('2023-01-02')

      const mockSubmissions = [
        {
          problemId: 1,
          createTime: newerDate,
          result: 'Accepted',
          submissionResult: [{ result: 'Accepted' }]
        },
        {
          problemId: 1,
          createTime: olderDate,
          result: 'Wrong Answer',
          submissionResult: [{ result: 'Wrong Answer' }]
        }
      ]

      db.assignment.findUnique.resolves(mockAssignment)
      db.userGroup.findFirst.resolves({ isGroupLeader: false })
      db.assignmentRecord.findUnique.resolves(null)
      db.assignmentProblem.findMany.resolves(mockAssignmentProblems)
      db.submission.findMany.resolves(mockSubmissions)

      const result = await service.getAssignmentSubmissionSummary(
        assignmentId,
        userId
      )

      expect(result).to.have.lengthOf(1)
      expect(result[0].problemId).to.equal(1)
      expect(result[0].submission?.submissionResult).to.equal('Accepted')
      expect(result[0].submission?.submissionTime).to.deep.equal(newerDate)
    })
  })
  describe('membership authorization', () => {
    const userId = submissions[0].userId
    const problemId = problems[0].id
    const detail = {
      id: submissions[0].id,
      problemId,
      userId,
      userRole: Role.User,
      contestId: null,
      assignmentId: ASSIGNMENT_ID
    }
    const assignmentList = { problemId, userId, assignmentId: ASSIGNMENT_ID }
    const contestList = { problemId, userId, contestId: CONTEST_ID }

    beforeEach(() => {
      db.assignment.findFirst.resolves(mockAssignment)
      db.assignment.findUnique.resolves(mockAssignment)
      db.userGroup.findFirst.resolves({ isGroupLeader: false })
      db.userContest.findFirst.resolves(null)
      db.userContest.findUnique.resolves({ role: 'Participant' })
      db.contest.findUnique.resolves(mockContest)
      db.contest.findFirst.resolves(mockContest)
      db.assignmentRecord.findUnique.resolves(null)
      db.contestRecord.findUnique.resolves(null)
      db.problem.findFirst.resolves(problems[0])
      db.assignmentProblem.findUnique.resolves({ problem: problems[0] })
      db.assignmentProblem.findFirst.resolves({ assignment: mockAssignment })
      db.assignmentProblem.findMany.resolves([{ problemId }])
      db.contestProblem.findFirst.resolves({})
      db.submission.findFirst.resolves({
        ...submissions[0],
        user: { username: 'user' },
        submissionResult: []
      })
      db.submission.findMany.resolves([])
      db.submission.count.resolves(0)
    })

    const assignmentReads = [
      {
        name: 'detail',
        run: (service: SubmissionService) => service.getSubmission(detail)
      },
      {
        name: 'list',
        run: (service: SubmissionService) =>
          service.getAssignmentSubmissions(assignmentList)
      },
      {
        name: 'latest',
        run: (service: SubmissionService) =>
          service.getLatestAssignmentProblemSubmission(
            problemId,
            ASSIGNMENT_ID,
            userId
          )
      },
      {
        name: 'summary',
        run: (service: SubmissionService) =>
          service.getAssignmentSubmissionSummary(ASSIGNMENT_ID, userId)
      }
    ]
    for (const { name, run } of assignmentReads) {
      it(`allows assignment ${name} for a member without a record`, async () => {
        await run(service)
        expect(db.userGroup.findFirst.firstCall.args[0].where).to.deep.equal({
          groupId: mockAssignment.groupId,
          userId
        })
        expect(db.assignmentRecord.findUnique.called).to.be.false
        expect(db.assignmentRecord.upsert.called).to.be.false
      })
      it(`denies assignment ${name} for a nonmember with a stale record`, async () => {
        db.userGroup.findFirst.resolves(null)
        db.assignmentRecord.findUnique.resolves({ id: 1 })
        await expect(run(service)).to.be.rejectedWith(ForbiddenAccessException)
        expect(db.submission.findFirst.called).to.be.false
        expect(db.submission.findMany.called).to.be.false
      })
    }

    it('returns empty data and null summaries, and distinguishes missing submissions', async () => {
      expect(
        (await service.getAssignmentSubmissions(assignmentList)).data
      ).to.deep.equal([])
      expect(
        await service.getAssignmentSubmissionSummary(ASSIGNMENT_ID, userId)
      ).to.deep.equal([{ problemId, submission: null }])
      db.submission.findFirst.resolves(null)
      await expect(
        service.getLatestAssignmentProblemSubmission(
          problemId,
          ASSIGNMENT_ID,
          userId
        )
      ).to.be.rejectedWith(NotFoundException, 'Submission')
    })

    it('rejects an unrelated assignment problem for an authorized member', async () => {
      db.assignmentProblem.findFirst.resolves(null)
      await expect(
        service.getAssignmentSubmissions(assignmentList)
      ).to.be.rejectedWith(EntityNotExistException, 'AssignmentProblem')
      expect(db.submission.findMany.called).to.be.false
    })

    it('denies assignment submission for a nonmember with a stale record', async () => {
      db.userGroup.findFirst.resolves(null)
      db.assignmentRecord.findUnique.resolves({ id: 1 })
      await expect(
        service.submitToAssignment({
          ...assignmentList,
          submissionDto,
          userIp: USERIP
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.assignmentRecord.upsert.called).to.be.false
    })

    for (const name of ['detail', 'list']) {
      const run = (service: SubmissionService) =>
        name === 'detail'
          ? service.getSubmission({
              ...detail,
              assignmentId: null,
              contestId: CONTEST_ID
            })
          : service.getContestSubmissions(contestList)
      it(`allows contest ${name} for a registered user without a record`, async () => {
        await run(service)
        expect(db.contestRecord.findUnique.called).to.be.false
        expect(db.contestRecord.upsert.called).to.be.false
      })
      it(`denies contest ${name} for an unregistered user with a stale record`, async () => {
        db.userContest.findUnique.resolves(null)
        db.contestRecord.findUnique.resolves({ id: 1 })
        await expect(run(service)).to.be.rejectedWith(
          EntityNotExistException,
          'UserContest'
        )
      })
    }

    for (const userRole of [Role.Admin, Role.SuperAdmin]) {
      it(`requires membership before the ${userRole} detail exception`, async () => {
        db.userGroup.findFirst.resolves(null)
        await expect(
          service.getSubmission({ ...detail, userRole })
        ).to.be.rejectedWith(ForbiddenAccessException)
        db.userContest.findUnique.resolves(null)
        await expect(
          service.getSubmission({
            ...detail,
            userRole,
            assignmentId: null,
            contestId: CONTEST_ID
          })
        ).to.be.rejectedWith(EntityNotExistException, 'UserContest')
      })
    }

    it('keeps Course leaders limited to their own assignment list', async () => {
      db.userGroup.findFirst.resolves({ isGroupLeader: true })
      await service.getAssignmentSubmissions(assignmentList)
      expect(db.submission.findMany.firstCall.args[0].where.userId).to.equal(
        userId
      )
    })

    it('keeps contest staff access subject to result masking', async () => {
      db.userContest.findFirst.resolves({ id: 1 })
      db.userContest.findUnique.resolves(null)
      db.contest.findUnique.resolves({
        ...mockContest,
        isJudgeResultVisible: false
      })
      db.submission.findFirst.resolves({
        ...submissions[0],
        userId: userId + 1,
        user: { username: 'other' },
        submissionResult: []
      })
      expect(
        (
          await service.getSubmission({
            ...detail,
            assignmentId: null,
            contestId: CONTEST_ID
          })
        ).result
      ).to.equal('Blind')
      await service.getContestSubmissions(contestList)
      expect(db.submission.findMany.firstCall.args[0].where.userId).to.be
        .undefined
    })

    it('keeps assignment leader access subject to hidden result masking', async () => {
      db.userGroup.findFirst.resolves({ isGroupLeader: true })
      db.assignment.findUnique.resolves({
        ...mockAssignment,
        isJudgeResultVisible: false
      })
      db.submission.findFirst.resolves({
        ...submissions[0],
        userId: userId + 1,
        user: { username: 'other' },
        submissionResult: [
          {
            result: ResultStatus.Accepted,
            problemTestcase: { isHidden: false }
          },
          {
            result: ResultStatus.WrongAnswer,
            problemTestcase: { isHidden: true }
          }
        ]
      })
      const result = await service.getSubmission(detail)
      expect(result.testcaseResult).to.have.lengthOf(1)
      expect(result.testcaseResult[0].problemTestcase.isHidden).to.be.false
      expect(result.result).to.equal(ResultStatus.Accepted)
    })
  })

  describe('record persistence', () => {
    for (const kind of ['assignment', 'contest'] as const) {
      for (const hasTestcases of [true, false]) {
        it(`initializes ${kind} records before ${hasTestcases ? 'publishing' : 'immediate finalization'}`, async () => {
          const idOptions =
            kind === 'assignment'
              ? { assignmentId: ASSIGNMENT_ID }
              : { contestId: CONTEST_ID }
          const saved = { ...submissions[0], ...idOptions }
          db.submission.create.resolves(saved)
          stub(service, 'getJudgeableTestcases').resolves(
            hasTestcases ? [{ id: 1, isHidden: false }] : []
          )
          stub(service, 'createSubmissionResults').resolves()
          const publishStub = stub(publish, 'publishJudgeRequestMessage')
          await service.createSubmission({
            submissionDto,
            problem: problems[0],
            userId: saved.userId,
            userIp: USERIP,
            idOptions
          })
          const parent =
            kind === 'assignment'
              ? db.assignmentRecord.upsert
              : db.contestRecord.upsert
          expect(parent.calledOnce).to.be.true
          expect(parent.calledBefore(db.submission.create)).to.be.true
          if (kind === 'assignment') {
            expect(parent.calledBefore(db.assignmentProblemRecord.upsert)).to.be
              .true
            expect(
              db.assignmentProblemRecord.upsert.calledBefore(
                db.submission.create
              )
            ).to.be.true
          }
          const afterSave = hasTestcases
            ? publishStub
            : (finalization.applyFinalizationEffects as SinonStub)
          expect(db.submission.create.calledBefore(afterSave)).to.be.true
          expect(afterSave.calledOnce).to.be.true
        })
      }
    }

    it('does not initialize records when code validation fails', async () => {
      await expect(
        service.createSubmission({
          submissionDto,
          problem: { ...problems[0], languages: [] },
          userId: submissions[0].userId,
          userIp: USERIP,
          idOptions: { assignmentId: ASSIGNMENT_ID }
        })
      ).to.be.rejectedWith(ConflictFoundException)
      expect(db.assignmentRecord.upsert.called).to.be.false
      expect(db.assignmentProblemRecord.upsert.called).to.be.false
      expect(db.submission.create.called).to.be.false
    })
  })

  // TODO: 기획 문의 / 확정 후 Test DB 기반으로 재작성 예정
  // describe('getContestSubmisssion', () => {
  //   it('should return submission', async () => {
  //     db.contestRecord.findUniqueOrThrow.resolves({
  //       contest: {
  //         groupId: problems[0].groupId,
  //         startTime: new Date(Date.now() - 10000),
  //         endTime: new Date(Date.now() - 10000)
  //       }
  //     })
  //     db.submission.findFirstOrThrow.resolves({
  //       ...submissions[0],
  //       submissionResult: submissionResults
  //     })

  //     expect(
  //       await service.getContestSubmission(
  //         submissions[0].id,
  //         problems[0].id,
  //         1,
  //         submissions[0].userId
  //       )
  //     ).to.deep.equal(submissionResults)
  //   })

  //   it('should throw exception if user is not registered to contest', async () => {
  //     db.contestRecord.findUniqueOrThrow.rejects(
  //       new NotFoundException('No contestRecord found error')
  //     )

  //     await expect(
  //       service.getContestSubmission(
  //         submissions[0].id,
  //         problems[0].id,
  //         1,
  //         submissions[0].userId
  //       )
  //     ).to.be.rejectedWith(NotFoundException)
  //   })

  //   it('should throw exception if the contest belong to different groups', async () => {
  //     db.contestRecord.findUniqueOrThrow.resolves({ contest: { groupId: 2 } })

  //     await expect(
  //       service.getContestSubmission(
  //         submissions[0].id,
  //         problems[0].id,
  //         1,
  //         submissions[0].userId
  //       )
  //     ).to.be.rejectedWith(EntityNotExistException)
  //   })

  //   it('should throw exception if submission does not exist', async () => {
  //     db.contestRecord.findUniqueOrThrow.resolves({
  //       contest: { groupId: problems[0].groupId }
  //     })
  //     db.submission.findFirstOrThrow.rejects(
  //       new NotFoundException('No submission found error')
  //     )

  //     await expect(
  //       service.getContestSubmission(
  //         submissions[0].id,
  //         problems[0].id,
  //         1,
  //         submissions[0].userId
  //       )
  //     ).to.be.rejectedWith(NotFoundException)
  //   })

  //   it('should throw exception if contest is ongoing and the submission does not belong to this user', async () => {
  //     db.contestRecord.findUniqueOrThrow.resolves({
  //       contest: {
  //         groupId: problems[0].groupId,
  //         startTime: new Date(Date.now() - 10000),
  //         endTime: new Date(Date.now() + 10000)
  //       }
  //     })
  //     db.submission.findFirstOrThrow.resolves({ ...submissions[0], userId: 2 })

  //     await expect(
  //       service.getContestSubmission(
  //         submissions[0].id,
  //         problems[0].id,
  //         1,
  //         submissions[0].userId
  //       )
  //     ).to.be.rejectedWith(ForbiddenAccessException)
  //   })
  // })

  // describe('getSubmissionResults', () => {
  //   it('should return judgeFinished=true when judge finished', async () => {
  //     const submissionId = 1
  //     const results = submissionResults.filter(
  //       (submissionResult) => submissionResult.submissionId === submissionId
  //     )
  //     db.submissionResult.findMany.resolves(results)

  //     const result = await service.getSubmissionResults(submissionId)

  //     expect(result).to.deep.equal({
  //       submissionResults: results,
  //       score: 100,
  //       passed: true,
  //       judgeFinished: true
  //     })
  //   })

  //   it('shoud return judgeFinished=false when judge not finished', async () => {
  //     const submissionId = 2
  //     db.submissionResult.findMany.resolves
  //     const results = submissionResults.filter(
  //       (submissionResult) => submissionResult.submissionId === submissionId
  //     )
  //     db.submissionResult.findMany.resolves(results)

  //     const result = await service.getSubmissionResults(submissionId)

  //     expect(result).to.deep.equal({
  //       submissionResults: results,
  //       score: 100,
  //       passed: false,
  //       judgeFinished: false
  //     })
  //   })

  //   it('shoud return passed=false when at least one of judge failed', async () => {
  //     const submissionId = 3
  //     db.submissionResult.findMany.resolves
  //     const results = submissionResults.filter(
  //       (submissionResult) => submissionResult.submissionId === submissionId
  //     )
  //     db.submissionResult.findMany.resolves(results)

  //     const result = await service.getSubmissionResults(submissionId)

  //     expect(result).to.deep.equal({
  //       submissionResults: results,
  //       score: 100,
  //       passed: false,
  //       judgeFinished: true
  //     })
  //   })
  // })
})
