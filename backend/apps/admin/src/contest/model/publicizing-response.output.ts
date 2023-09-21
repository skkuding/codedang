import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class PublicizingResponse {
  @Field(() => Int)
  contestId: number

  @Field(() => Boolean)
  isAccepted: boolean
}
