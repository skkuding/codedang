import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { CreateContestproblemInput } from './create-contestproblem.input'

@InputType()
export class UpdateContestproblemInput extends PartialType(
  CreateContestproblemInput
) {
  @Field(() => Int)
  id: number
}
