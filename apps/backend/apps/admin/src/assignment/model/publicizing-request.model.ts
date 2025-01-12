import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AssignmentPublicizingRequest {
  @Field(() => Int)
  assignmentId: number

  @Field(() => Int)
  userId: number

  @Field(() => String)
  expireTime: Date
}
