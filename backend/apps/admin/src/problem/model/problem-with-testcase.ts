import { Field, ObjectType } from '@nestjs/graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { Problem } from '@admin/@generated'

@ObjectType({ description: 'problemWithTestcase' })
export class ProblemWithTestcase extends Problem {
  @Field(() => [GraphQLJSONObject])
  testcase: JSON[]
}
