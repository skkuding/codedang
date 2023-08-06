import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'publicizingRequest' })
export class PublicizingRequest {
  @Field(() => Int)
  contestId: number

  @Field(() => Int)
  userId: number

  @Field(() => GraphQLISODateTime)
  expireTime: Date
}
