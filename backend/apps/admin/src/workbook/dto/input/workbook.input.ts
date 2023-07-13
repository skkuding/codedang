import { Field, InputType, Int } from '@nestjs/graphql'
import { WorkbookUpdateInput } from '@admin/@generated/workbook/workbook-update.input'

@InputType()
export class UpdateWorkbookInput extends WorkbookUpdateInput {
  @Field(() => Int, { nullable: false })
  declare id: number
}

@InputType()
export class CreateWorkbookInput extends WorkbookUpdateInput {
  @Field(() => Int, { nullable: false })
  declare groupId: number
}

@InputType()
export class GetWorkbookListInput {
  @Field(() => Int, { nullable: false })
  groupId: number
  @Field(() => Int, { nullable: false })
  cursor: number
  @Field(() => Int, { nullable: false })
  take: number
}
