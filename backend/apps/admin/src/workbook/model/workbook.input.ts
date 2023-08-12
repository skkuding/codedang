import { Field, InputType, Int } from '@nestjs/graphql'

// import { WorkbookUpdateInput } from '@admin/@generated/workbook/workbook-update.input';

@InputType()
export class UpdateWorkbookInput {
  @Field(() => Int, { nullable: false })
  declare id: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Date, { nullable: true })
  createTime?: Date | string

  @Field(() => Date, { nullable: true })
  updateTime?: Date | string
}

@InputType()
export class CreateWorkbookInput {
  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Date, { nullable: true })
  createTime?: Date | string

  @Field(() => Date, { nullable: true })
  updateTime?: Date | string
}
