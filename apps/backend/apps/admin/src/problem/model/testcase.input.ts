import { Field, InputType } from '@nestjs/graphql'
import { IntScoreScalar } from '../scalar/int-score.scalar'

@InputType()
export class Testcase {
  @Field(() => String)
  input!: string

  @Field(() => String)
  output!: string

  @Field(() => Boolean)
  isHidden!: boolean

  @Field(() => IntScoreScalar, { nullable: true })
  scoreWeight?: number
}
