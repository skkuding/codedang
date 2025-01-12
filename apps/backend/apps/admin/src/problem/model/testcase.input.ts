import { Field, InputType, PickType } from '@nestjs/graphql'
import { ProblemTestcaseCreateInput } from '@admin/@generated'
import { IntScoreScalar } from '../scalar/int-score.scalar'

@InputType()
export class Testcase extends PickType(ProblemTestcaseCreateInput, [
  'input',
  'output',
  'isHidden'
]) {
  @Field(() => IntScoreScalar, { nullable: true })
  scoreWeight?: number
}
