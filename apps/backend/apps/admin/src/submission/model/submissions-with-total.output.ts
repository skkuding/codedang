import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Submission } from '@admin/@generated'

/**
 * 제출 내역과 총 개수를 나타내는 Output Type
 *
 * - `data`: 제출 내역의 리스트
 * - `total`: 제출 내역의 총 개수
 *    - `data`의 길이와 무관하며, 실제로 DB에 존재하는 조건에 맞는 submission의 총 개수를 의미합니다.
 */
@ObjectType()
export class SubmissionsWithTotal {
  @Field(() => [Submission])
  data: Submission[]

  @Field(() => Int)
  total: number
}
