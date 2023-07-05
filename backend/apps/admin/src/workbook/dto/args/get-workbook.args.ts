import { Field, ArgsType, Int } from '@nestjs/graphql'

@ArgsType()
export class GetWorkbookArgs {
  @Field(() => Int, { nullable: false })
  groupId: number
  @Field(() => Int, { nullable: false })
  cursor: number
  @Field(() => Int, { nullable: false })
  take: number
}
