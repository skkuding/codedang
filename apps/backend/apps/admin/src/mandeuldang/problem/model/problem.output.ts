import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql'
import { CollaboratorRole, Problem } from '@admin/@generated'

/**
 * 만들당 문제 상세/목록 조회 결과.
 *
 * 기존 Problem 모델을 사용하되 서버 내부 공개 정책 필드인
 * visibleLockTime은 외부에 노출하지 않는다.
 *
 * 목록 조회에서는 관계 및 계산 필드가 생략될 수 있으므로
 * 만들당 전용 추가 필드는 nullable로 선언한다.
 */
@ObjectType()
export class MandeuldangProblemOutput extends OmitType(Problem, [
  'visibleLockTime'
] as const) {
  @Field(() => CollaboratorRole, {
    nullable: true,
    description:
      '요청한 사용자가 이 문제에 대해 가진 협업 역할. Owner/Editor/Reviewer가 아니면 null.'
  })
  myRole?: CollaboratorRole | null

  @Field(() => Int, {
    nullable: true,
    description: '등록된 테스트 파일의 개별 파일 개수'
  })
  testFileCount?: number | null

  @Field(() => Boolean, {
    nullable: true,
    description: '현재 상태에서 발행 가능한지 나타내는 미리보기 값'
  })
  canPublish?: boolean | null

  @Field(() => [String], {
    nullable: true,
    description: '발행에 필요한 누락 항목 코드 목록'
  })
  missingForPublish?: string[] | null
}
