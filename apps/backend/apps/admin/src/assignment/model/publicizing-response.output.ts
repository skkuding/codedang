import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class PublicizingResponse {
  @Field(() => Int)
  assignmentId: number

  @Field(() => Boolean)
  isAccepted: boolean
}
