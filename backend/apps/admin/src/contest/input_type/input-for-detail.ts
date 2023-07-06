import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@ObjectType()
export class InputForDetail {
  @Field(() => Int)
  @IsNotEmpty()
  groupId: number

  @Field(() => Int)
  @IsNotEmpty()
  itemId: number
}
