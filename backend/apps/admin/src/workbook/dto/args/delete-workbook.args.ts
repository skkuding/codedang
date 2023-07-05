import { Field, ArgsType, Int } from '@nestjs/graphql'

@ArgsType()
export class DeleteWorkbookArgs {
  @Field(() => Int, { nullable: false })
  groupId: number

  @Field(() => Int, { nullable: false })
  id: number
}
