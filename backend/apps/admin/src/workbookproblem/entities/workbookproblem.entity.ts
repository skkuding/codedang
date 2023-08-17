import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class Workbookproblem {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
