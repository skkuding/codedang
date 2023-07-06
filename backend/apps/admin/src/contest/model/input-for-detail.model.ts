import { Field, InputType, Int } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class InputForDetail {
  @Field(() => Int)
  @IsNotEmpty()
  groupId: number

  @Field(() => Int)
  @IsNotEmpty()
  itemId: number
}
