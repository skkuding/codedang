import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class GroupMember {
  @Field(() => ID)
  username: string

  @Field(() => ID)
  userId: number

  @Field(() => String)
  name?: string

  @Field(() => String)
  email?: string
}
