import { ProblemStatus } from '@prisma/client'

/**
 * 만들당(Mandeuldang) Draft/Ready 문제를 기존(레거시) 조회·제출 경로에서 제외하기 위한
 * 공통 where 조각.
 *
 * 만들당 문제 제작은 기존 `Problem` 모델을 그대로 쓰되 `status`(Draft/Ready/Published)로
 * 발행 상태를 관리한다. 발행 전(Draft/Ready) 문제는 `timeLimit` 등 필수 필드가 비어 있을 수
 * 있으므로, 학생/일반 조회나 제출 경로에 노출되면 안 된다. 각 호출부에서 개별적으로
 * `status: Published`를 붙이면 새 조회 경로가 추가될 때 누락되기 쉬우므로 한 곳에서 관리한다.
 *
 * 만들당 제작 전용 경로(management > problem > 제작 중인 문제)는 이 필터를 쓰지 않고
 * 전용 resolver/service를 통해 Draft/Ready 문제를 조회한다.
 */
export const PUBLISHED_PROBLEM_WHERE = {
  status: ProblemStatus.Published
} as const
