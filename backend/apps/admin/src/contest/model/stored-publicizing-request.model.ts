import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'storedPublicizingRequest' })
export class StoredPublicizingRequestOutput {
  @Field(() => Int)
  contest: number

  @Field(() => Int)
  user: number

  @Field(() => GraphQLISODateTime)
  createTime: Date
}
