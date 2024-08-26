import { Test, type TestingModule } from '@nestjs/testing'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { Submission, SubmissionResult } from '@prisma/client'
import { expect } from 'chai'
import { TraceService } from 'nestjs-otel'
import * as sinon from 'sinon'
import { EXCHANGE, PUBLISH_TYPE, SUBMISSION_KEY } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { JudgeRequest } from '../class/judge-request'
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
  score: 100
}

describe('SubmissionPublicationService', () => {
  let service: SubmissionPublicationService
  let amqpConnection: AmqpConnection

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
          provide: AmqpConnection,
          useFactory: () => ({
            publish: () => []
          })
        },
        TraceService
      ]
    }).compile()

    service = module.get<SubmissionPublicationService>(
      SubmissionPublicationService
    )
    amqpConnection = module.get<AmqpConnection>(AmqpConnection)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('publishJudgeRequestMessage', () => {
    it('should publish to RabbitMQ', async () => {
      const findSpy = sandbox
        .stub(db.problem, 'findUnique')
        .resolves(problems[0])
      const amqpSpy = sandbox.stub(amqpConnection, 'publish').resolves()
      const judgeRequest = new JudgeRequest(
        submissions[0].code,
        submission.language,
        problems[0]
      )

      await expect(
        service.publishJudgeRequestMessage(submissions[0].code, submission)
      ).not.to.be.rejected

      expect(
        findSpy.calledOnceWith({
          where: {
            id: submission.id
          },
          select: {
            id: true,
            timeLimit: true,
            memoryLimit: true
          }
        })
      ).to.be.true
      expect(
        amqpSpy.calledOnceWith(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
          messageId: String(submission.id),
          persistent: true,
          type: PUBLISH_TYPE
        })
      ).to.be.true
    })

    it('should throw EntityNotExistException when problemId is invalid', async () => {
      sandbox.stub(db.problem, 'findUnique').resolves(undefined)

      await expect(
        service.publishJudgeRequestMessage(submissions[0].code, submission)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
