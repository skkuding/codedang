import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { Submission, TestSubmission } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import {
  EXCHANGE,
  JUDGE_MESSAGE_TYPE,
  MESSAGE_PRIORITY_HIGH,
  MESSAGE_PRIORITY_LOW,
  MESSAGE_PRIORITY_MIDDLE,
  RUN_MESSAGE_TYPE,
  SUBMISSION_KEY,
  USER_TESTCASE_MESSAGE_TYPE
} from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Snippet } from './class/create-submission.dto'
import { JudgeRequest, UserTestcaseJudgeRequest } from './class/judge-request'

@Injectable()
export class SubmissionPublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService
  ) {}

  /**
   * 채점 요청 메시지를 발행합니다.
   *
   * 1. 제출 기록에 해당하는 문제를 조회하여 시간 제한(timeLimit)과 메모리 제한(memoryLimit) 정보를 가져옴
   *    문제를 찾지 못하면 예외를 발생
   * 2. `isUserTest` 플래그에 따라 다음 중 하나의 채점 요청 객체를 생성
   *    - 사용자 테스트인 경우: `UserTestcaseJudgeRequest` 객체를 생성하며, 사용자 정의 테스트케이스를 포함
   *    - 아닌 경우: 일반 채점 요청인 `JudgeRequest` 객체를 생성
   * 3. AMQP 프로토콜을 사용하여 지정된 EXCHANGE와 라우팅 키(SUBMISSION_KEY)를 통해 채점 요청 메시지를 발행
   *
   * @param {Object} params - 채점 요청 파라미터
   * @param {Snippet[]} params.code - 제출한 코드 스니펫 배열
   * @param {Submission | TestSubmission} params.submission - 생성된 제출 기록
   * @param {boolean} [params.isTest=false] - 공개 테스트 케이스 채점 여부 (기본값=false)
   * @param {boolean} [params.isUserTest=false] - 사용자 정의 테스트 케이스 채점 여부 (기본값=false)
   * @param {{ id: number; in: string; out: string }[]} [params.userTestcases] - 사용자 정의 테스트 케이스 배열
   * @param {boolean} [params.stopOnNotAccepted=false] - 테스트 케이스 실패 시 중단 여부 (기본값=false)
   * @param {boolean} [params.judgeOnlyHiddenTestcases=false] - 숨김 테스트 케이스만 채점 여부 (기본값=false)
   * @param {boolean} [params.containHiddenTestcases=false] - 숨김 테스트 케이스 결과의 포함 여부 (기본값=false)
   * @returns {Promise<void>}
   * @throws {EntityNotExistException} 제출 기록에 해당하는 문제를 찾을 수 없는 경우
   */
  @Span()
  async publishJudgeRequestMessage({
    code,
    submission,
    isTest = false,
    isUserTest = false,
    userTestcases,
    stopOnNotAccepted = false,
    judgeOnlyHiddenTestcases = false,
    containHiddenTestcases = false
  }: {
    code: Snippet[]
    submission: Submission | TestSubmission
    isTest?: boolean
    isUserTest?: boolean
    userTestcases?: { id: number; in: string; out: string }[]
    stopOnNotAccepted?: boolean
    judgeOnlyHiddenTestcases?: boolean
    containHiddenTestcases?: boolean
  }): Promise<void> {
    const problem = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        id: true,
        timeLimit: true,
        memoryLimit: true
      }
    })

    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    const judgeRequest = isUserTest
      ? new UserTestcaseJudgeRequest(
          code,
          submission.language,
          problem,
          userTestcases!,
          stopOnNotAccepted
        )
      : new JudgeRequest(
          code,
          submission.language,
          problem,
          stopOnNotAccepted,
          judgeOnlyHiddenTestcases,
          containHiddenTestcases
        )

    const span = this.traceService.startSpan(
      'publishJudgeRequestMessage.publish'
    )
    span.setAttributes({ submissionId: submission.id })

    await this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: String(submission.id),
      persistent: true,
      type: this.calculateMessageType(isTest, isUserTest),
      priority: this.calculateMessagePriority(isTest, isUserTest)
    })
    span.end()
  }

  /**
   * 채점 요청 메세지의 타입을 계산하여 반환
   *
   * - RUN_MESSAGE_TYPE: 오픈 테스트 케이스 실행
   * - USER_TESTCASE_MESSAGE_TYPE: 사용자 정의 테스트 케이스 실행
   * - JUDGE_MESSAGE_TYPE: 제출
   *
   * @param isTest - 테스트 제출 여부
   * @param isUserTest - 사용자 정의 테스트 케이스 제출 여부
   */
  private calculateMessageType(isTest: boolean, isUserTest: boolean) {
    if (isTest) return RUN_MESSAGE_TYPE
    if (isUserTest) return USER_TESTCASE_MESSAGE_TYPE
    return JUDGE_MESSAGE_TYPE
  }

  /**
   * 채점 요청 메세지의 우선순위를 계산하여 반환
   *
   * 우선순위 (0 ~ 3, 클 수록 우선순위 높음)
   *
   * - JUDGE_MESSAGE_TYPE: 3
   * - RUN_MESSAGE_TYPE: 2
   * - USER_TESTCASE_MESSAGE_TYPE: 2
   * - DEFAULT: 1
   *
   * @param isTest - 테스트 제출 여부
   * @param isUserTest - 사용자 정의 테스트 케이스 제출 여부
   */
  private calculateMessagePriority(isTest: boolean, isUserTest: boolean) {
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
}
