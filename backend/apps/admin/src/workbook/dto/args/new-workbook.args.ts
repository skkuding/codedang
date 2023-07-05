import { Field, ID, ArgsType, Int } from '@nestjs/graphql'

@ArgsType()
export class NewWorkbookArgs {
  @Field(() => String, { nullable: false })
  title: string

  @Field(() => String, { nullable: false })
  description: string

  @Field(() => Boolean, { nullable: false })
  isVisible: boolean

  @Field(() => Int, { nullable: false })
  groupId: number
}
