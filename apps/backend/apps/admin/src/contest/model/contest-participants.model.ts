import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ContestParticipant {
  @Field(() => Int)
  id: number

  @Field(() => String)
  username: string

  @Field(() => String)
  major: string | null

  @Field(() => String)
  email: string

  @Field(() => Boolean)
  isBlocked: boolean
}
