import { Field, InputType, Int } from '@nestjs/graphql'
import { QnACategory } from '@generated'

@InputType()
export class UpdateContestQnAInput {
  @Field(() => Int, { nullable: false })
  order!: number

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => String, { nullable: true })
  answer?: string
}

@InputType()
export class GetContestQnAsFilterInput {
  @Field(() => [QnACategory], { nullable: true })
  categories?: QnACategory[]

  @Field(() => [Int], { nullable: true })
  problemOrders?: number[]

  @Field(() => String, { nullable: true })
  orderBy?: 'asc' | 'desc'

  @Field(() => Boolean, { nullable: true })
  isResolved?: boolean
}
