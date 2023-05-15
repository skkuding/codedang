import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateSubmissionInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
