import { HttpModule } from '@nestjs/axios'
import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  Language,
  ResultStatus,
  Role,
  type Contest,
  type User
} from '@prisma/client'
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
import { ProblemRepository } from '@client/problem/problem.repository'
import { Snippet } from '../class/create-submission.dto'
import { problems } from '../mock/problem.mock'
import { submissions, submissionDto } from '../mock/submission.mock'
import { submissionResults } from '../mock/submissionResult.mock'
import { SubmissionPublicationService } from '../submission-pub.service'
import { SubmissionService } from '../submission.service'

const db = {
  submission: {
    findMany: stub(),
    findFirstOrThrow: stub(),
    findUnique: stub(),
    create: stub(),
    update: stub(),
    count: stub().resolves(1)
  },
  submissionResult: {
    create: stub(),
    createMany: stub(),
    updateMany: stub()
  },
  problem: {
    findFirstOrThrow: stub(),
    findUniqueOrThrow: stub(),
    findUnique: stub(),
    update: stub()
  },
  problemTestcase: {
    findMany: stub()
  },
  contest: {
    findFirstOrThrow: stub()
  },
  contestProblem: {
    findUniqueOrThrow: stub(),
    findFirstOrThrow: stub()
  },
  workbookProblem: {
    findUniqueOrThrow: stub()
  },
  contestRecord: {
    findUniqueOrThrow: stub(),
    update: stub()
  },
  user: {
    findFirstOrThrow: stub(),
    findFirst: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

const CONTEST_ID = 1
const WORKBOOK_ID = 1
const mockContest: Contest = {
  id: CONTEST_ID,
  createdById: 1,
  groupId: 1,
  title: 'SKKU Coding Platform 모의대회',
  description: 'test',
  invitationCode: 'test',
  startTime: new Date(),
  endTime: new Date(),
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime: new Date(),
  updateTime: new Date()
}
const USERIP = '127.0.0.1'

describe('SubmissionService', () => {
  let service: SubmissionService
  let problemRepository: ProblemRepository
  let publish: SubmissionPublicationService

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
          provide: ProblemRepository,
          useValue: { hasPassedProblem: () => [] }
        },
        {
          provide: SubmissionPublicationService,
          useFactory: () => ({ publishJudgeRequestMessage: () => [] })
        }
      ]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
    problemRepository = module.get<ProblemRepository>(ProblemRepository)
    publish = module.get<SubmissionPublicationService>(
      SubmissionPublicationService
    )
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('submitToProblem', () => {
    it('should call createSubmission', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      const createSpy = stub(service, 'createSubmission')

      await service.submitToProblem(
        submissionDto,
        USERIP,
        submissions[0].userId,
        problems[0].groupId
      )
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if problem is not found', async () => {
      db.problem.findFirstOrThrow.rejects(
        new NotFoundException('No problem found error')
      )
      const createSpy = stub(service, 'createSubmission')

      await expect(
        service.submitToProblem(
          submissionDto,
          USERIP,
          submissions[0].userId,
          problems[0].groupId
        )
      ).to.be.rejectedWith(NotFoundException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('submitToContest', () => {
    it('should call createSubmission', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.contest.findFirstOrThrow(mockContest)
      db.contestRecord.findUniqueOrThrow.resolves({
        contest: {
          groupId: 1,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() + 10000)
        }
      })
      db.contestProblem.findUniqueOrThrow.resolves({ problem: problems[0] })

      await service.submitToContest(
        submissionDto,
        USERIP,
        submissions[0].userId,
        problems[0].id,
        CONTEST_ID,
        problems[0].groupId
      )
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if contest is not ongoing', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.contestRecord.findUniqueOrThrow.resolves({
        contest: {
          groupId: 1,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() - 10000)
        }
      })
      db.contestProblem.findUniqueOrThrow.resolves({
        problem: {
          ...problems[0],
          visibleLockTime: new Date(Date.now() + 10000)
        }
      })

      await expect(
        service.submitToContest(
          submissionDto,
          USERIP,
          submissions[0].userId,
          problems[0].id,
          CONTEST_ID,
          problems[0].groupId
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('submitToWorkbook', () => {
    it('should call createSubmission', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.workbookProblem.findUniqueOrThrow.resolves({ problem: problems[0] })

      await service.submitToWorkbook(
        submissionDto,
        USERIP,
        submissions[0].userId,
        problems[0].id,
        WORKBOOK_ID,
        problems[0].groupId
      )
      expect(createSpy.calledOnce).to.be.true
    })

    it('should throw exception if groupId does not match or problem is not exposed', async () => {
      const createSpy = stub(service, 'createSubmission')
      db.workbookProblem.findUniqueOrThrow.resolves({
        problem: {
          ...problems[0],
          visibleLockTime: new Date(Date.now() + 10000)
        }
      })

      await expect(
        service.submitToWorkbook(
          submissionDto,
          USERIP,
          submissions[0].userId,
          problems[0].id,
          WORKBOOK_ID,
          problems[0].groupId
        )
      ).to.be.rejectedWith(EntityNotExistException)
      expect(createSpy.called).to.be.false
    })
  })

  describe('createSubmission', () => {
    it('should create submission', async () => {
      const createSpy = stub(service, 'createSubmissionResults')
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves(submissions[0])

      expect(
        await service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP
        )
      ).to.be.deep.equal(submissions[0])
      expect(createSpy.calledOnceWith(submissions[0])).to.be.true
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should create submission with contestId', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      const hasPassedSpy = stub(problemRepository, 'hasPassedProblem').resolves(
        false
      )
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves({
        ...submissions[0],
        contestId: CONTEST_ID
      })
      db.problemTestcase.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])

      expect(
        await service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP,
          { contestId: CONTEST_ID }
        )
      ).to.be.deep.equal({ ...submissions[0], contestId: CONTEST_ID })
      expect(publishSpy.calledOnce).to.be.true
      expect(hasPassedSpy.calledOnce).to.be.true
    })

    it('should throw conflict found exception if user has already gotten AC', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves(submissions[0])
      db.submission.findMany.resolves([{ result: ResultStatus.Accepted }])

      await expect(
        service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP,
          { contestId: CONTEST_ID }
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(publishSpy.calledOnce).to.be.false
    })

    it('should create submission with workbookId', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problemTestcase.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves({
        ...submissions[0],
        workbookId: WORKBOOK_ID
      })

      expect(
        await service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP,
          { workbookId: WORKBOOK_ID }
        )
      ).to.be.deep.equal({ ...submissions[0], workbookId: WORKBOOK_ID })
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should create submission with contestId', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      const hasPassedSpy = stub(problemRepository, 'hasPassedProblem').resolves(
        false
      )
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves({
        ...submissions[0],
        contestId: CONTEST_ID
      })
      db.problemTestcase.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])

      expect(
        await service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP,
          { contestId: CONTEST_ID }
        )
      ).to.be.deep.equal({ ...submissions[0], contestId: CONTEST_ID })
      expect(publishSpy.calledOnce).to.be.true
      expect(hasPassedSpy.calledOnce).to.be.true
    })

    it('should throw conflict found exception if user has already gotten AC', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves(submissions[0])
      db.submission.findMany.resolves([{ result: ResultStatus.Accepted }])

      await expect(
        service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP,
          { contestId: CONTEST_ID }
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(publishSpy.calledOnce).to.be.false
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
        await service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId,
          USERIP,
          { workbookId: WORKBOOK_ID }
        )
      ).to.be.deep.equal({ ...submissions[0], workbookId: WORKBOOK_ID })
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should throw exception if the language is not supported', async () => {
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])

      await expect(
        service.createSubmission(
          { ...submissionDto, language: Language.Python3 },
          problems[0],
          submissions[0].userId,
          USERIP
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(publishSpy.calledOnce).to.be.false
    })

    it('should throw error if locked code is modified', async () => {
      const validateSpy = spy(service, 'isValidCode')
      const publishSpy = stub(publish, 'publishJudgeRequestMessage')
      db.problem.findUnique.resolves(problems[0])

      await expect(
        service.createSubmission(
          {
            ...submissionDto,
            code: plainToInstance(Snippet, submissions[1].code)
          },
          problems[0],
          submissions[0].userId,
          USERIP
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(validateSpy.returnValues[0]).to.be.false
      expect(publishSpy.calledOnce).to.be.false
    })
  })

  describe('getSubmissions', () => {
    it('should return submissions', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.submission.findMany.resolves(submissions)

      expect(
        await service.getSubmissions({ problemId: problems[0].id })
      ).to.be.deep.equal({ data: submissions, total: 1 })
    })

    it('should throw not found error', async () => {
      db.problem.findFirstOrThrow.rejects(
        new NotFoundException('No problem found error')
      )

      await expect(
        service.getSubmissions({ problemId: problems[0].id })
      ).to.be.rejectedWith(NotFoundException)
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

      const passSpy = spy(problemRepository, 'hasPassedProblem')
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.submission.findFirstOrThrow.resolves({
        ...submissions[0],
        user: { username: 'username' },
        submissionResult: submissionResults
      })
      db.user.findFirstOrThrow.resolves({
        username: 'username',
        id: submissions[0].userId,
        role: Role.User
      })

      expect(
        await service.getSubmission(
          submissions[0].id,
          problems[0].id,
          submissions[0].userId,
          Role.User,
          undefined,
          null
        )
      ).to.be.deep.equal({
        problemId: problems[0].id,
        username: 'username',
        code: submissions[0].code.map((snippet) => snippet.text).join('\n'),
        language: submissions[0].language,
        createTime: submissions[0].createTime,
        result: submissions[0].result,
        testcaseResult
      })
      expect(passSpy.called).to.be.false
    })

    it('should throw exception if problem is not found', async () => {
      db.problem.findFirstOrThrow.rejects(
        new NotFoundException('No problem found error')
      )

      await expect(
        service.getSubmission(
          submissions[0].id,
          problems[0].id,
          submissions[0].userId,
          Role.User,
          undefined,
          null
        )
      ).to.be.rejectedWith(NotFoundException)
    })

    it('should throw exception if submission is not found', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.submission.findFirstOrThrow.rejects(
        new NotFoundException('No submission found error')
      )

      await expect(
        service.getSubmission(
          submissions[0].id,
          problems[0].id,
          submissions[0].userId,
          Role.User,
          undefined,
          null
        )
      ).to.be.rejectedWith(NotFoundException)
    })

    it("should throw exception if submission is not user's and user has not passed this problem", async () => {
      const passSpy = stub(problemRepository, 'hasPassedProblem').resolves(
        false
      )
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.submission.findFirstOrThrow.resolves({ ...submissions[0], userId: 2 })

      await expect(
        service.getSubmission(
          submissions[0].id,
          problems[0].id,
          submissions[0].userId,
          Role.User,
          undefined,
          null
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(passSpy.calledOnce).to.be.true
    })
  })

  describe('getContestSubmisssions', () => {
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
        studentId: null,
        major: null
      }
      db.contestRecord.findUniqueOrThrow.resolves()
      db.contestProblem.findFirstOrThrow.resolves()
      db.submission.findMany.resolves(submissions)
      db.user.findFirst.resolves(adminUser)
      db.contest.findFirstOrThrow.resolves({ isJudgeVisible: true })

      expect(
        await service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: 1,
          userId: submissions[0].userId
        })
      ).to.be.deep.equal({ data: submissions, total: 1 })
    })

    it('should throw exception if user is not registered to contest', async () => {
      db.user.findFirst.resolves(null)
      db.contestRecord.findUniqueOrThrow.rejects(
        new NotFoundException('No contestRecord found error')
      )

      await expect(
        service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: 1,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(NotFoundException)
    })

    it("should throw exception if contest doesn't have this problem", async () => {
      db.contestRecord.findUniqueOrThrow.resolves()
      db.contestProblem.findFirstOrThrow.rejects(
        new NotFoundException('No contestProblem found error')
      )

      await expect(
        service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: 1,
          userId: submissions[0].userId
        })
      ).to.be.rejectedWith(NotFoundException)
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
