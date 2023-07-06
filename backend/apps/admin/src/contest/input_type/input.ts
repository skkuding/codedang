import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@ObjectType()
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
