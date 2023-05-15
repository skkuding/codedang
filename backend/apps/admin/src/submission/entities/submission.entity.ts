import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class Submission {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
