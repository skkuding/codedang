import { Test, type TestingModule } from '@nestjs/testing'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Language } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EXCHANGE, SUBMISSION_KEY } from '@libs/constants'
import { calculateTimeLimit, calculateMemoryLimit } from '@libs/constants'
import { ActionNotAllowedException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { CreateSubmissionDto } from './dto/create-submission.dto'
import { JudgeRequest } from './dto/judge-request.class'
import { problems } from './mock/problem.mock'
import { problemTestcases } from './mock/problemTestcase.mock'
import { submissions } from './mock/submission.mock'
import { submissionResults } from './mock/submissionResult.mock'
import { SubmissionService } from './submission.service'

const db = {
  submission: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub(),
    create: stub()
  },
  submissionResult: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub(),
    createMany: stub()
  },
  problem: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub()
  },
  problemTestcase: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub()
  }
}

describe('SubmissionService', () => {
  let service: SubmissionService
  let amqpConnection: AmqpConnection

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        { provide: PrismaService, useValue: db },
        {
          provide: AmqpConnection,
          useFactory: () => ({
            publish: () => [],
            createSubscriber: () => []
          })
        }
      ]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
    amqpConnection = module.get<AmqpConnection>(AmqpConnection)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getSubmissionResults', () => {
    it('should return judgeFinished=true when judge finished', async () => {
      const submissionId = 'test01'
      const results = submissionResults.filter(
        (submissionResult) => submissionResult.submissionId === submissionId
      )
      db.submissionResult.findMany.resolves(results)

      const result = await service.getSubmissionResults(submissionId)

      expect(result).to.deep.equal({
        submissionResults: results,
        score: 100,
        passed: true,
        judgeFinished: true
      })
    })

    it('shoud return judgeFinished=false when judge not finished', async () => {
      const submissionId = 'test02'
      db.submissionResult.findMany.resolves
      const results = submissionResults.filter(
        (submissionResult) => submissionResult.submissionId === submissionId
      )
      db.submissionResult.findMany.resolves(results)

      const result = await service.getSubmissionResults(submissionId)

      expect(result).to.deep.equal({
        submissionResults: results,
        score: 100,
        passed: false,
        judgeFinished: false
      })
    })

    it('shoud return passed=false when at least one of judge failed', async () => {
      const submissionId = 'test03'
      db.submissionResult.findMany.resolves
      const results = submissionResults.filter(
        (submissionResult) => submissionResult.submissionId === submissionId
      )
      db.submissionResult.findMany.resolves(results)

      const result = await service.getSubmissionResults(submissionId)

      expect(result).to.deep.equal({
        submissionResults: results,
        score: 100,
        passed: false,
        judgeFinished: true
      })
    })
  })

  describe('createSubmission', () => {
    it('should return submission create results', async () => {
      const submissionId = 'test01'
      const userId = 1
      const problemId = 1
      const amqpConnectionSpyPublish = stub(
        amqpConnection,
        'publish'
      ).resolves()
      const createSubmissionDTO: CreateSubmissionDto = {
        code: 'code',
        language: Language.C,
        problemId
      }
      const judgeRequest = new JudgeRequestDto(
        submissions[0].code,
        submissions[0].language,
        submissions[0].problemId,
        calculateTimeLimit(submissions[0].language, problems[0].timeLimit),
        calculateMemoryLimit(submissions[0].language, problems[0].memoryLimit)
      )
      db.submission.create.resolves(submissions[0])
      db.submissionResult.createMany.resolves()
      db.submissionResult.findMany.resolves(
        submissionResults
          .filter(
            (submissionResult) => submissionResult.submissionId === submissionId
          )
          .map((submissionResult) => submissionResult.id)
      )
      db.problem.findUnique.resolves(problems[0])
      db.problemTestcase.findMany.resolves([...problemTestcases])

      const result = await service.createSubmission(createSubmissionDTO, userId)

      expect(result).to.deep.equal({
        ...submissions[0],
        submissionResultIds: submissionResults
          .filter(
            (submissionResult) => submissionResult.submissionId === submissionId
          )
          .map((submissionResult) => submissionResult.id)
      })

      expect(
        amqpConnectionSpyPublish.calledOnceWith(
          EXCHANGE,
          SUBMISSION_KEY,
          judgeRequest,
          {
            persistent: true,
            messageId: submissionId,
            type: 'judge'
          }
        )
      ).to.be.true
    })

    it('should throw ActionNotAllowedException when sumbit with unsupported language', async () => {
      const problemId = 1
      const userId = 1
      const createSubmissionDTO: CreateSubmissionDto = {
        code: 'code',
        language: Language.Python3,
        problemId
      }
      db.problem.findUnique.resolves(problems[0])

      await expect(
        service.createSubmission(createSubmissionDTO, userId)
      ).to.be.rejectedWith(ActionNotAllowedException)
    })
  })
})
