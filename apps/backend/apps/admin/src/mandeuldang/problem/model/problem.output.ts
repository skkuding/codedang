import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql'
import { CollaboratorRole, Problem } from '@admin/@generated'

/**
 * 만들당 문제 상세/목록 조회 결과.
 *
 * DB는 MandeuldangProblem이라는 별도 모델 없이 기존 Problem을 그대로 쓰기로 결정됐으므로
 * (백엔드 회의 08.20 결론), 자동 생성된 Problem GraphQL 타입을 그대로 확장한다 —
 * ProblemWithIsVisible(../../problem/model/problem.output.ts)이 이미 같은 패턴을 쓰고 있다.
 * 기존 Problem 모델을 사용하되 서버 내부 공개 정책 필드인
 * visibleLockTime은 외부에 노출하지 않는다.
 *
 * 목록 전용 Output 타입은 따로 만들지 않았다. 목록 조회에서는 아래 관계·계산 필드를
 * 채우지 않고 undefined로 두면 되므로(전부 nullable), 상세 조회와 타입을 공유해도
 * 계약이 깨지지 않는다.
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
  myRole?: `${CollaboratorRole}` | null

  // mandeuldangCollaborators/mandeuldangSolution/mandeuldangTools는 기존 생성된
  // Problem 타입에 이미 관계 필드로 선언돼 있어(부모 필드) 여기서 다시 선언하지 않는다 —
  // 서비스가 Prisma include로 채워 넣은 값이 그대로 상속된 필드에 실린다.

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
