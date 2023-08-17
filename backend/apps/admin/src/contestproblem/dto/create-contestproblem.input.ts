import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateContestproblemInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
