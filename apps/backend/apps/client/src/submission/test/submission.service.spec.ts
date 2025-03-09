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
import { StorageService } from '@libs/storage'
import { Snippet } from '../class/create-submission.dto'
import { problems } from '../mock/problem.mock'
import { submissions, submissionDto } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
import { SubmissionPublicationService } from '../submission-pub.service'
import { SubmissionService } from '../submission.service'

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
    findFirst: stub()
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
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  evaluateWithSampleTestcase: false,
  createTime: new Date(),
  updateTime: new Date(),
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
  isFinalScoreVisible: true
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
        { provide: StorageService, useValue: { readObject: () => [] } },
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
      db.contest.findFirst.resolves(mockContest)
      db.contestRecord.findUnique.resolves({
        contest: {
          groupId: 1,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() + 10000)
        }
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
      db.assignmentRecord.findUnique.resolves({
        id: 1,
        assignment: {
          groupId: 1,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() + 10000)
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
      expect(createSpy.calledOnceWith(submissions[0])).to.be.true
      expect(publishSpy.calledOnce).to.be.true
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
      db.contestRecord.findUnique.resolves(null)

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
      db.assignmentRecord.findUnique.resolves(null)

      await expect(
        service.getAssignmentSubmissions({
          problemId: problems[0].id,
          assignmentId: ASSIGNMENT_ID,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(EntityNotExistException)
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
