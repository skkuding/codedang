import { Field, Int, InputType } from '@nestjs/graphql'

@InputType()
export class GetUsersInput {
  @Field(() => Int)
  id: number

  @Field()
  role: string

  @Field(() => Int)
  cursor: number

  @Field(() => Int)
  take: number
}
