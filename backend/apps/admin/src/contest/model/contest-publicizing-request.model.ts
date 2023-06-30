import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'contestPublicizingRequest' })
export class ContestPublicizingRequest {
  @Field(() => Int)
  userId: number

  @Field(() => Int)
  contestId: number
}
