import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class ScoreWeights {
  @Field(() => Int, { nullable: true, description: '점수 가중치 분자' })
  scoreWeightNumerator?: number

  @Field(() => Int, { nullable: true, description: '점수 가중치 분모' })
  scoreWeightDenominator?: number

  @Field(() => Int, { nullable: true })
  scoreWeight?: number
}

@InputType()
export class Testcase extends ScoreWeights {
  @Field(() => Int, { nullable: true, description: '기존 TC 구분용 ID 필드' })
  id?: number

  @Field(() => String)
  input!: string

  @Field(() => String)
  output!: string

  @Field(() => Boolean)
  isHidden!: boolean
}
