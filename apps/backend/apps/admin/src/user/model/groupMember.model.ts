import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class GroupMember {
  @Field(() => String)
  username: string

  @Field(() => Number)
  userId: number

  @Field(() => String)
  name?: string

  @Field(() => String)
  email: string

  @Field(() => String)
  studentId?: string

  @Field(() => String)
  major?: string

  @Field(() => String)
  role: string
}
