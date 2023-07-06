import { Field, InputType, Int } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class Input {
  @Field(() => Int)
  @IsNotEmpty()
  groupId: number

  @Field(() => Int)
  cursor?: number

  @Field(() => Int)
  @IsNotEmpty()
  take: number
}
