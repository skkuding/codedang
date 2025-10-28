import { Injectable, Logger } from '@nestjs/common'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import { Span, TraceService } from 'nestjs-otel'
import {
  CONSUME_CHANNEL,
  EXCHANGE,
  ORIGIN_HANDLER_NAME,
  RESULT_KEY,
  RESULT_QUEUE,
  CHECK_EXCHANGE,
  CHECK_RESULT_KEY,
  CHECK_RESULT_QUEUE,
  CHECK_CONSUME_CHANNEL,
  CHECK_KEY,
  CHECK_MESSAGE_TYPE,
  RUN_MESSAGE_TYPE,
  USER_TESTCASE_MESSAGE_TYPE,
  JUDGE_MESSAGE_TYPE,
  MESSAGE_PRIORITY_HIGH,
  MESSAGE_PRIORITY_MIDDLE,
  MESSAGE_PRIORITY_LOW,
  SUBMISSION_KEY
} from '@libs/constants'

@Injectable()
export class JudgeAMQPService {
  private readonly logger = new Logger(JudgeAMQPService.name)

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

  startSubscription() {
    this.amqpConnection.createSubscriber(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (msg: object, raw: any) => {
        try {
          // 메시지 타입에 따라 적절한 핸들러로 라우팅
          if (
            raw.properties.type === RUN_MESSAGE_TYPE ||
            raw.properties.type === USER_TESTCASE_MESSAGE_TYPE
          ) {
            if (this.messageHandlers?.onRunMessage) {
              await this.messageHandlers.onRunMessage(
                msg,
                raw.properties.type === USER_TESTCASE_MESSAGE_TYPE
              )
            }
            return
          }

          if (this.messageHandlers?.onJudgeMessage) {
            await this.messageHandlers.onJudgeMessage(msg)
          }
        } catch (error) {
          this.logger.error(error, 'Unexpected error in message handler')
          return new Nack()
        }
      },
      {
        exchange: EXCHANGE,
        routingKey: RESULT_KEY,
        queue: RESULT_QUEUE,
        queueOptions: {
          channel: CONSUME_CHANNEL
        }
      },
      ORIGIN_HANDLER_NAME
    )
  }

  /**
   * 채점 요청 메시지를 발행합니다.
   */
  @Span()
  async publishJudgeRequestMessage(
    judgeRequest: object,
    submissionId: number,
    isTest = false,
    isUserTest = false,
    isRejudge = false
  ): Promise<void> {
    const span = this.traceService.startSpan(
      'publishJudgeRequestMessage.publish'
    )
    span.setAttributes({ submissionId })

    await this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: String(submissionId),
      persistent: true,
      type: this.calculateMessageType(isTest, isUserTest),
      priority: this.calculateMessagePriority(isTest, isUserTest, isRejudge)
    })
    span.end()
  }

  /**
   * 메시지 타입을 계산하여 반환
   */
  private calculateMessageType(isTest: boolean, isUserTest: boolean) {
    if (isTest) return RUN_MESSAGE_TYPE
    if (isUserTest) return USER_TESTCASE_MESSAGE_TYPE
    return JUDGE_MESSAGE_TYPE
  }

  /**
   * 메시지 우선순위를 계산하여 반환
   */
  private calculateMessagePriority(
    isTest: boolean,
    isUserTest: boolean,
    isRejudge: boolean
  ) {
    // 재채점인 경우 항상 LOW priority
    if (isRejudge) {
      return MESSAGE_PRIORITY_LOW
    }

    const msgType = this.calculateMessageType(isTest, isUserTest)

    switch (msgType) {
      case JUDGE_MESSAGE_TYPE:
        return MESSAGE_PRIORITY_HIGH
      case RUN_MESSAGE_TYPE:
      case USER_TESTCASE_MESSAGE_TYPE:
        return MESSAGE_PRIORITY_MIDDLE
      default:
        return MESSAGE_PRIORITY_LOW
    }
  }

  /**
   * 메시지 핸들러 설정
   */
  setMessageHandlers(handlers: {
    onRunMessage?: (msg: object, isUserTest: boolean) => Promise<void>
    onJudgeMessage?: (msg: object) => Promise<void>
  }) {
    this.messageHandlers = handlers
  }

  private messageHandlers?: {
    onRunMessage?: (msg: object, isUserTest: boolean) => Promise<void>
    onJudgeMessage?: (msg: object) => Promise<void>
  }
}

@Injectable()
export class CheckAMQPService {
  private readonly logger = new Logger(CheckAMQPService.name)

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

  startSubscription() {
    this.amqpConnection.createSubscriber(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (msg: object, _: any) => {
        try {
          if (this.messageHandlers?.onCheckMessage) {
            await this.messageHandlers?.onCheckMessage(msg)
          }
        } catch (error) {
          this.logger.error(error, 'Unexpected error in handling check message')
          return new Nack()
        }
      },
      {
        exchange: CHECK_EXCHANGE,
        routingKey: CHECK_RESULT_KEY,
        queue: CHECK_RESULT_QUEUE,
        queueOptions: {
          channel: CHECK_CONSUME_CHANNEL
        }
      },
      ORIGIN_HANDLER_NAME
    )
  }

  /**
   * 채점 요청 메시지를 발행합니다.
   */
  @Span()
  async publishCheckRequestMessage(
    checkId: number,
    checkRequest: object
  ): Promise<void> {
    const span = this.traceService.startSpan(
      'publishCheckRequestMessage.publish'
    )

    await this.amqpConnection.publish(CHECK_EXCHANGE, CHECK_KEY, checkRequest, {
      messageId: String(checkId),
      persistent: true,
      type: CHECK_MESSAGE_TYPE
    })
    span.end()
  }

  /**
   * 메시지 핸들러 설정
   */
  setMessageHandlers(handlers: {
    onCheckMessage?: (msg: object) => Promise<void>
  }) {
    this.messageHandlers = handlers
  }

  private messageHandlers?: {
    onCheckMessage?: (msg: object) => Promise<void>
  }
}
