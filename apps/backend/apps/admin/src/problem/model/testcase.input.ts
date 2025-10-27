import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class Testcase {
  @Field(() => Int, { nullable: true, description: '기존 TC 구분용 ID 필드' })
  id?: number

  @Field(() => String)
  input!: string

  @Field(() => String)
  output!: string

  @Field(() => Boolean)
  isHidden!: boolean

  // 분수로 저장하기 위한 새로운 필드들
  @Field(() => Int, { nullable: true, description: '점수 가중치 분자' })
  scoreWeightNumerator?: number

  @Field(() => Int, { nullable: true, description: '점수 가중치 분모' })
  scoreWeightDenominator?: number

  @Field(() => Int, { nullable: true })
  scoreWeight?: number
}
