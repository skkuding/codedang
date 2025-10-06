import { ObjectType, Field } from '@nestjs/graphql'
import { ContestQnA } from '@generated'

@ObjectType()
export class ContestQnAWithIsRead extends ContestQnA {
  @Field(() => Boolean)
  isRead!: boolean
}
