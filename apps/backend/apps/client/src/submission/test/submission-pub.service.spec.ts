import { Test, type TestingModule } from '@nestjs/testing'
import { Prisma, type Submission, type SubmissionResult } from '@prisma/client'
import { expect } from 'chai'
import { TraceService } from 'nestjs-otel'
import * as sinon from 'sinon'
import { AMQPService } from '@libs/amqp'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { JudgeRequest, UserTestcaseJudgeRequest } from '../class/judge-request'
import { problems } from '../mock/problem.mock'
import { submissions } from '../mock/submission.mock'
import { SubmissionPublicationService } from '../submission-pub.service'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFunc = (...args: object[]) => []

const db = {
  problem: {
    findUnique: mockFunc
  }
}

const submission: Submission & { submissionResult: SubmissionResult[] } = {
  ...submissions[0],
  codeSize: 1000,
  submissionResult: [],
  score: new Prisma.Decimal(100)
}

describe('SubmissionPublicationService', () => {
  let service: SubmissionPublicationService
  let amqpService: AMQPService

  const sandbox = sinon.createSandbox()

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionPublicationService,
        {
          provide: PrismaService,
          useValue: db
        },
        {
          provide: AMQPService,
          useFactory: () => ({
            publishJudgeRequestMessage: () => []
          })
        },
        TraceService
      ]
    }).compile()

    service = module.get<SubmissionPublicationService>(
      SubmissionPublicationService
    )
    amqpService = module.get<AMQPService>(AMQPService)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('publishJudgeRequestMessage', () => {
    it('should publish judge message to RabbitMQ', async () => {
      const findSpy = sandbox
        .stub(db.problem, 'findUnique')
        .resolves(problems[0])
      const mqttSpy = sandbox
        .stub(amqpService, 'publishJudgeRequestMessage')
        .resolves()
      const judgeRequest = new JudgeRequest(
        submissions[0].code,
        submission.language,
        problems[0]
      )

      await expect(
        service.publishJudgeRequestMessage({
          code: submissions[0].code,
          submission
        })
      ).not.to.be.rejected

      expect(
        findSpy.calledOnceWith({
          where: {
            id: submission.problemId
          },
          select: {
            id: true,
            timeLimit: true,
            memoryLimit: true
          }
        })
      ).to.be.true
      expect(mqttSpy.calledOnceWith(judgeRequest, submission.id, false, false))
        .to.be.true
    })

    it('should publish run message to RabbitMQ', async () => {
      const findSpy = sandbox
        .stub(db.problem, 'findUnique')
        .resolves(problems[0])
      const mqttSpy = sandbox
        .stub(amqpService, 'publishJudgeRequestMessage')
        .resolves()
      const judgeRequest = new JudgeRequest(
        submissions[0].code,
        submission.language,
        problems[0]
      )

      await expect(
        service.publishJudgeRequestMessage({
          code: submissions[0].code,
          submission,
          isTest: true
        })
      ).not.to.be.rejected

      expect(
        findSpy.calledOnceWith({
          where: {
            id: submission.problemId
          },
          select: {
            id: true,
            timeLimit: true,
            memoryLimit: true
          }
        })
      ).to.be.true
      expect(mqttSpy.calledOnceWith(judgeRequest, submission.id, true, false))
        .to.be.true
    })

    it('should throw EntityNotExistException when problemId is invalid', async () => {
      sandbox.stub(db.problem, 'findUnique').resolves(undefined)

      await expect(
        service.publishJudgeRequestMessage({
          code: submissions[0].code,
          submission
        })
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should create UserTestcaseJudgeRequest when isUserTest is true', async () => {
      const findSpy = sandbox
        .stub(db.problem, 'findUnique')
        .resolves(problems[0])
      const mqttSpy = sandbox
        .stub(amqpService, 'publishJudgeRequestMessage')
        .resolves()
      const userTestcases = [
        { id: 1, in: 'input1', out: 'output1' },
        { id: 2, in: 'input2', out: 'output2' }
      ]
      const userTestcaseJudgeRequest = new UserTestcaseJudgeRequest(
        submissions[0].code,
        submission.language,
        problems[0],
        userTestcases,
        true
      )

      await expect(
        service.publishJudgeRequestMessage({
          code: submissions[0].code,
          submission,
          isUserTest: true,
          userTestcases,
          stopOnNotAccepted: true
        })
      ).not.to.be.rejected

      expect(
        findSpy.calledOnceWith({
          where: {
            id: submission.problemId
          },
          select: {
            id: true,
            timeLimit: true,
            memoryLimit: true
          }
        })
      ).to.be.true
      expect(
        mqttSpy.calledOnceWith(
          userTestcaseJudgeRequest,
          submission.id,
          false,
          true
        )
      ).to.be.true
    })

    it('should create JudgeRequest with additional parameters', async () => {
      const findSpy = sandbox
        .stub(db.problem, 'findUnique')
        .resolves(problems[0])
      const mqttSpy = sandbox
        .stub(amqpService, 'publishJudgeRequestMessage')
        .resolves()
      const judgeRequest = new JudgeRequest(
        submissions[0].code,
        submission.language,
        problems[0],
        true,
        true,
        true
      )

      await expect(
        service.publishJudgeRequestMessage({
          code: submissions[0].code,
          submission,
          stopOnNotAccepted: true,
          judgeOnlyHiddenTestcases: true,
          containHiddenTestcases: true
        })
      ).not.to.be.rejected

      expect(
        findSpy.calledOnceWith({
          where: {
            id: submission.problemId
          },
          select: {
            id: true,
            timeLimit: true,
            memoryLimit: true
          }
        })
      ).to.be.true
      expect(mqttSpy.calledOnceWith(judgeRequest, submission.id, false, false))
        .to.be.true
    })
  })
})
