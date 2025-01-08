import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'publicizingRequest' })
export class PublicizingRequest {
  @Field(() => Int)
  assignmentId: number

  @Field(() => Int)
  userId: number

  @Field(() => String)
  expireTime: Date
}
