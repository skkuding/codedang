import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class UpdateContestQnAInput {
  @Field(() => Int, { nullable: false })
  order!: number

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => String, { nullable: true })
  answer?: string
}
