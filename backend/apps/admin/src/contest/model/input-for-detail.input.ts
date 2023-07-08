import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class InputForDetail {
  @Field(() => Int, { nullable: false })
  groupId!: number

  @Field(() => Int, { nullable: false })
  itemId!: number
}
