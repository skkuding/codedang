import { Field, ID, InputType, Int } from '@nestjs/graphql'

@InputType()
export class Input {
  @Field(() => ID, { nullable: false })
  groupId!: string

  @Field(() => Int)
  cursor?: number

  @Field(() => Int, { nullable: false })
  take!: number
}
