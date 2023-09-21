import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'publicizingRequestResult' })
export class PublicizingRequestResult {
  @Field(() => Int)
  contestId: number

  @Field(() => Boolean)
  requestResult: boolean
}
