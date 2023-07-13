import { Field, Int, InputType } from '@nestjs/graphql'

@InputType()
export class JoinInput {
  @Field(() => Int)
  groupId: number

  @Field(() => Int)
  userId: number
}
