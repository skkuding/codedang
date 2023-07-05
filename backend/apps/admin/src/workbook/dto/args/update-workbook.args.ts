import { Field, ArgsType, Int } from '@nestjs/graphql'
import { NewWorkbookArgs } from './new-workbook.args'

@ArgsType()
export class UpdateWorkbookArgs extends NewWorkbookArgs {
  @Field(() => Int, { nullable: false })
  id: number
}
