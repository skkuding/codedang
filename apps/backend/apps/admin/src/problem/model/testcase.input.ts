import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class Testcase {
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

  // @deprecated - 하위 호환성을 위해 유지, 추후 제거 예정
  @Field(() => Int, {
    nullable: true,
    deprecationReason:
      'Use scoreWeightNumerator and scoreWeightDenominator instead'
  })
  scoreWeight?: number
}
