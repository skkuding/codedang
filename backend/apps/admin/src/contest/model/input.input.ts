import { Field, InputType, Int } from '@nestjs/graphql'

@InputType({ description: 'input' })
export class Input {
  @Field(() => Int, { nullable: false })
  groupId!: number

  @Field(() => Int)
  cursor?: number

  @Field(() => Int, { nullable: false })
  take!: number
}
