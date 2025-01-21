import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { Submission } from '@prisma/client'
import { Span, TraceService } from 'nestjs-otel'
import {
  EXCHANGE,
  JUDGE_MESSAGE_TYPE,
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
   * 3. AMQP 프로토콜을 사용하여 지정된 EXCHANGE와 라우팅 키(SUBMISSION_KEY)를 통해
   *
   * @param {Snippet[]} code - 제출한 코드 스니펫 배열
   * @param {Submission} submission - 생성된 제출 기록
   * @param {boolean} [isTest=false] - 공개 테스트 케이스 채점 여부 (기본값=false)
   * @param {boolean} [isUserTest=false] - 사용자 정의 테스트 케이스 채점 여부 (기본값=false)
   * @param {{ id: number; in: string; out: string }[]} [userTestcases] - 사용자 정의 테스트 케이스 배열
   * @returns {Promise<void>}
   * @throws {EntityNotExistException} 제출 기록에 해당하는 문제를 찾을 수 없는 경우
   */
  @Span()
  async publishJudgeRequestMessage(
    code: Snippet[],
    submission: Submission,
    isTest = false,
    isUserTest = false,
    userTestcases?: { id: number; in: string; out: string }[]
  ): Promise<void> {
    const problem = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        id: true,
        timeLimit: true,
        memoryLimit: true
      }
    })

    if (!problem) {
      throw new EntityNotExistException('problem')
    }

    const judgeRequest = isUserTest
      ? new UserTestcaseJudgeRequest(
          code,
          submission.language,
          problem,
          userTestcases!
        )
      : new JudgeRequest(code, submission.language, problem)

    const span = this.traceService.startSpan(
      'publishJudgeRequestMessage.publish'
    )
    span.setAttributes({ submissionId: submission.id })

    await this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      messageId: String(submission.id),
      persistent: true,
      type: isTest
        ? RUN_MESSAGE_TYPE
        : isUserTest
          ? USER_TESTCASE_MESSAGE_TYPE
          : JUDGE_MESSAGE_TYPE
    })
    span.end()
  }
}
