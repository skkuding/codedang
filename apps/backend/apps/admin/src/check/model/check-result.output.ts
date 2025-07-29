import { Field, Float, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CheckResultOutput {
  @Field(() => Int, { nullable: false })
  userId1: number

  @Field(() => Int, { nullable: false })
  userId2: number

  @Field(() => Float, { nullable: false })
  plagiarismRate: number
}
