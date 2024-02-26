import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateWorkbookInput {
  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Date, { nullable: true })
  createTime?: Date | string

  @Field(() => Date, { nullable: true })
  updateTime?: Date | string
}

@InputType()
export class UpdateWorkbookInput {
  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Date, { nullable: true })
  updateTime?: Date | string
}
