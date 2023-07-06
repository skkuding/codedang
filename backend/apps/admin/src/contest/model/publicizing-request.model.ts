import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'publicizingRequest' })
export class PublicizingRequest {
  @Field(() => Int)
  contest: number

  @Field(() => Int)
  user: number

  @Field(() => GraphQLISODateTime)
  createTime: Date
}
