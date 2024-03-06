import { HttpModule } from '@nestjs/axios'
import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Language, ResultStatus } from '@prisma/client'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { spy, stub } from 'sinon'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Snippet } from './dto/create-submission.dto'
import type { JudgerResponse } from './dto/judger-response.dto'
import { problems } from './mock/problem.mock'
import { submissions, submissionDto } from './mock/submission.mock'
import { judgerResponse, submissionResults } from './mock/submissionResult.mock'
import { SubmissionService } from './submission.service'

const db = {
  submission: {
    findMany: stub(),
    findFirstOrThrow: stub(),
    create: stub(),
    update: stub(),
    count: stub().resolves(1)
  },
  submissionResult: {
    create: stub()
  },
  problem: {
    findFirstOrThrow: stub(),
    findUnique: stub(),
    update: stub()
  },
  contestProblem: {
    findUniqueOrThrow: stub(),
    findFirstOrThrow: stub()
  },
  workbookProblem: {
    findUniqueOrThrow: stub()
  },
  contestRecord: {
    findUniqueOrThrow: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

const CONTEST_ID = 1
const WORKBOOK_ID = 1

describe('SubmissionService', () => {
  let service: SubmissionService
  let amqpConnection: AmqpConnection

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        SubmissionService,
        { provide: PrismaService, useValue: db },
        {
          provide: AmqpConnection,
          useFactory: () => ({
            publish: () => [],
            createSubscriber: () => []
          })
        },
        ConfigService
      ]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
    amqpConnection = module.get<AmqpConnection>(AmqpConnection)
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
        problem: { ...problems[0], exposeTime: new Date(Date.now() + 10000) }
      })

      await expect(
        service.submitToContest(
          submissionDto,
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
        problem: { ...problems[0], exposeTime: new Date(Date.now() + 10000) }
      })

      await expect(
        service.submitToWorkbook(
          submissionDto,
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
      const publishSpy = stub(amqpConnection, 'publish')
      db.problem.findUnique.resolves(problems[0])
      db.submission.create.resolves(submissions[0])

      expect(
        await service.createSubmission(
          submissionDto,
          problems[0],
          submissions[0].userId
        )
      ).to.be.deep.equal(submissions[0])
      expect(publishSpy.calledOnce).to.be.true
    })

    it('should throw exception if the language is not supported', async () => {
      const publishSpy = stub(amqpConnection, 'publish')
      db.problem.findUnique.resolves(problems[0])

      await expect(
        service.createSubmission(
          { ...submissionDto, language: Language.Python3 },
          problems[0],
          submissions[0].userId
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(publishSpy.calledOnce).to.be.false
    })

    it('should throw error if locked code is modified', async () => {
      const validateSpy = spy(service, 'isValidCode')
      const publishSpy = stub(amqpConnection, 'publish')
      db.problem.findUnique.resolves(problems[0])

      await expect(
        service.createSubmission(
          {
            ...submissionDto,
            code: plainToInstance(Snippet, submissions[1].code)
          },
          problems[0],
          submissions[0].userId
        )
      ).to.be.rejectedWith(ConflictFoundException)
      expect(validateSpy.returnValues[0]).to.be.false
      expect(publishSpy.calledOnce).to.be.false
    })
  })

  describe('handleJudgerMessage', () => {
    it('should call update submission result', async () => {
      const updateSpy = stub(service, 'updateSubmissionResult')

      await service.handleJudgerMessage(judgerResponse)
      expect(updateSpy.calledOnce).to.be.true
    })

    it('should throw UnprocessableDataException when result code is Server Error', async () => {
      const target: JudgerResponse = {
        resultCode: 7,
        error: 'succeed',
        submissionId: '1',
        data: {
          acceptedNum: 1,
          totalTestcase: 1,
          judgeResult: [
            {
              testcaseId: '1',
              resultCode: 1,
              cpuTime: 1,
              realTime: 1,
              memory: 1,
              signal: 1,
              exitCode: 1,
              errorCode: 1
            }
          ]
        }
      }

      await expect(service.handleJudgerMessage(target)).to.be.rejectedWith(
        UnprocessableDataException
      )
    })
  })

  describe('updateSubmissionResult', () => {
    it('should call update submission result', async () => {
      db.submission.update.reset()
      db.submission.update.resolves(submissions[0])
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.update.reset()
      submissionResults.forEach((result, index) => {
        db.submissionResult.create.onCall(index).resolves(result)
      })

      await service.updateSubmissionResult(
        submissions[0].id,
        ResultStatus.CompileError,
        submissionResults
      )
      expect(db.submission.update.calledOnce).to.be.true
      expect(db.problem.update.calledOnce).to.be.true
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
          cpuTime: result.cpuTime.toString()
        }
      })

      const passSpy = spy(service, 'hasPassedProblem')
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.submission.findFirstOrThrow.resolves({
        ...submissions[0],
        user: { username: 'username' },
        submissionResult: submissionResults
      })

      expect(
        await service.getSubmission(
          submissions[0].id,
          problems[0].id,
          submissions[0].userId
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
          submissions[0].userId
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
          submissions[0].userId
        )
      ).to.be.rejectedWith(NotFoundException)
    })

    it("should throw exception if submission is not user's and user has not passed this problem", async () => {
      const passSpy = spy(service, 'hasPassedProblem')
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.submission.findFirstOrThrow.resolves({ ...submissions[0], userId: 2 })
      db.submission.findMany.resolves([{ result: ResultStatus.WrongAnswer }])

      await expect(
        service.getSubmission(
          submissions[0].id,
          problems[0].id,
          submissions[0].userId
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(await passSpy.returnValues[0]).to.be.false
    })
  })

  describe('getContestSubmisssions', () => {
    it('should return submissions', async () => {
      db.contestRecord.findUniqueOrThrow.resolves()
      db.contestProblem.findFirstOrThrow.resolves()
      db.submission.findMany.resolves(submissions)

      expect(
        await service.getContestSubmissions({
          problemId: problems[0].id,
          contestId: 1,
          userId: submissions[0].userId
        })
      )
    })

    it('should throw exception if user is not registered to contest', async () => {
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

  describe('judgerMessageTypeHandler', () => {
    it('should throw error when resultCode is invalid', async () => {
      const target = {
        resultCode: -1,
        data: 'Test Error',
        error: 'Test Error',
        submissionId: 1
      }

      await expect(service.validateJudgerResponse(target)).to.be.rejected
    })

    it('should return message object', async () => {
      const target: JudgerResponse = {
        resultCode: 5,
        error: 'succeed',
        submissionId: '1',
        data: {
          acceptedNum: 1,
          totalTestcase: 1,
          judgeResult: [
            {
              testcaseId: '1',
              resultCode: 1,
              cpuTime: 1,
              realTime: 1,
              memory: 1,
              signal: 1,
              exitCode: 1,
              errorCode: 1
            }
          ]
        }
      }

      const result = await service.validateJudgerResponse(target)

      expect(result).to.be.deep.equal(target)
    })
  })

  it('should handle message without error', async () => {
    const target = {
      resultCode: 0,
      submissionId: '1',
      error: '',
      data: {
        acceptedNum: 1,
        totalTestcase: 1,
        judgeResult: [
          {
            testcaseId: '18:30',
            resultCode: 0,
            cpuTime: 0,
            realTime: 0,
            memory: 1044480,
            signal: 0,
            exitCode: 0,
            errorCode: 0
          }
        ]
      }
    }

    const result = await service.validateJudgerResponse(target)

    expect(result).to.be.deep.equal(target)
  })

  describe('getContestSubmisssion', () => {
    it('should return submission', async () => {
      db.contestRecord.findUniqueOrThrow.resolves({
        contest: {
          groupId: problems[0].groupId,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() - 10000)
        }
      })
      db.submission.findFirstOrThrow.resolves({
        ...submissions[0],
        submissionResult: submissionResults
      })

      expect(
        await service.getContestSubmission(
          submissions[0].id,
          problems[0].id,
          1,
          submissions[0].userId
        )
      ).to.deep.equal(submissionResults)
    })

    it('should throw exception if user is not registered to contest', async () => {
      db.contestRecord.findUniqueOrThrow.rejects(
        new NotFoundException('No contestRecord found error')
      )

      await expect(
        service.getContestSubmission(
          submissions[0].id,
          problems[0].id,
          1,
          submissions[0].userId
        )
      ).to.be.rejectedWith(NotFoundException)
    })

    it('should throw exception if the contest belong to different groups', async () => {
      db.contestRecord.findUniqueOrThrow.resolves({ contest: { groupId: 2 } })

      await expect(
        service.getContestSubmission(
          submissions[0].id,
          problems[0].id,
          1,
          submissions[0].userId
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw exception if submission does not exist', async () => {
      db.contestRecord.findUniqueOrThrow.resolves({
        contest: { groupId: problems[0].groupId }
      })
      db.submission.findFirstOrThrow.rejects(
        new NotFoundException('No submission found error')
      )

      await expect(
        service.getContestSubmission(
          submissions[0].id,
          problems[0].id,
          1,
          submissions[0].userId
        )
      ).to.be.rejectedWith(NotFoundException)
    })

    it('should throw exception if contest is ongoing and the submission does not belong to this user', async () => {
      db.contestRecord.findUniqueOrThrow.resolves({
        contest: {
          groupId: problems[0].groupId,
          startTime: new Date(Date.now() - 10000),
          endTime: new Date(Date.now() + 10000)
        }
      })
      db.submission.findFirstOrThrow.resolves({ ...submissions[0], userId: 2 })

      await expect(
        service.getContestSubmission(
          submissions[0].id,
          problems[0].id,
          1,
          submissions[0].userId
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

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
