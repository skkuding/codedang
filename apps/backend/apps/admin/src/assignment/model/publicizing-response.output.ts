import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AssignmentPublicizingResponse {
  @Field(() => Int)
  assignmentId: number

  @Field(() => Boolean)
  isAccepted: boolean
}
