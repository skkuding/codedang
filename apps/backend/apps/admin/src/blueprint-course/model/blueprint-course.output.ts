import { ObjectType, OmitType } from '@nestjs/graphql'
import { BlueprintCourse } from '@admin/@generated'

/**
 * Blueprint 강좌의 기본 정보입니다.
 *
 * 생성된 BlueprintCourse 타입에서 서비스가 채우지 않는 필드를 제외합니다.
 * - `_count`: non-null 필드라 값이 없으면 GraphQL 응답이 실패합니다.
 * - `createdBy`, `courseInfo`, `blueprintAssignment`: 관계를 조회하지 않아 항상 null이 됩니다.
 *   Section 목록 등 관계 정보가 필요한 응답은 별도 필드로 추가합니다.
 */
@ObjectType()
export class BlueprintCourseOutput extends OmitType(BlueprintCourse, [
  '_count',
  'createdBy',
  'courseInfo',
  'blueprintAssignment'
] as const) {}
