import type { ConfigService } from '@nestjs/config'
import type { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { expect } from 'chai'
import type { TraceService } from 'nestjs-otel'
import * as sinon from 'sinon'
import { DEFAULT_SUBMISSION_KEY, EXCHANGE } from '@libs/constants'
import { JudgeAMQPService } from './amqp.service'

type RoutingKeyConfig = Partial<
  Record<
    | 'SUBMISSION_KEY'
    | 'TEST_KEY'
    | 'REJUDGE_KEY'
    | 'JUDGE_SUBMISSION_ROUTING_KEY',
    string
  >
>

describe('JudgeAMQPService', () => {
  const sandbox = sinon.createSandbox()
  const publish = sandbox.stub().resolves()
  const traceService = {
    startSpan: sandbox.stub().returns({
      setAttributes: sandbox.stub(),
      end: sandbox.stub()
    })
  } as unknown as TraceService

  afterEach(() => {
    sandbox.resetHistory()
  })

  const createService = function (config: RoutingKeyConfig) {
    const configService = {
      get: (key: keyof RoutingKeyConfig) => config[key]
    } as ConfigService

    return new JudgeAMQPService(
      { publish } as unknown as AmqpConnection,
      traceService,
      configService
    )
  }

  const expectRoutingKey = async function (
    service: JudgeAMQPService,
    routingKey: string,
    isTest = false,
    isUserTest = false,
    isRejudge = false
  ) {
    await service.publishJudgeRequestMessage(
      { request: routingKey },
      42,
      isTest,
      isUserTest,
      isRejudge
    )

    expect(publish.calledWith(EXCHANGE, routingKey)).to.be.true
    sandbox.resetHistory()
  }

  const createRoutingKeyConfig = function (
    entries: [keyof RoutingKeyConfig, string][]
  ): RoutingKeyConfig {
    return Object.fromEntries(entries)
  }

  it('uses workload-specific routing keys when configured', async () => {
    const service = createService(
      createRoutingKeyConfig([
        ['SUBMISSION_KEY', 'submission.key'],
        ['TEST_KEY', 'test.key'],
        ['REJUDGE_KEY', 'rejudge.key']
      ])
    )

    await expectRoutingKey(service, 'submission.key')
    await expectRoutingKey(service, 'test.key', true)
    await expectRoutingKey(service, 'test.key', false, true)
    await expectRoutingKey(service, 'rejudge.key', false, false, true)
  })

  it('falls back to the legacy submission routing key for every workload', async () => {
    const service = createService(
      createRoutingKeyConfig([
        ['JUDGE_SUBMISSION_ROUTING_KEY', 'legacy.submission.key']
      ])
    )

    await expectRoutingKey(service, 'legacy.submission.key')
    await expectRoutingKey(service, 'legacy.submission.key', true)
    await expectRoutingKey(service, 'legacy.submission.key', false, true)
    await expectRoutingKey(service, 'legacy.submission.key', false, false, true)
  })

  it('falls back to the built-in submission key when no routing key is configured', async () => {
    const service = createService({})

    await expectRoutingKey(service, DEFAULT_SUBMISSION_KEY)
    await expectRoutingKey(service, DEFAULT_SUBMISSION_KEY, true)
    await expectRoutingKey(service, DEFAULT_SUBMISSION_KEY, false, true)
    await expectRoutingKey(service, DEFAULT_SUBMISSION_KEY, false, false, true)
  })
})
