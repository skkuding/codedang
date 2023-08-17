import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateWorkbookproblemInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
