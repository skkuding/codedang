import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class Contestproblem {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
