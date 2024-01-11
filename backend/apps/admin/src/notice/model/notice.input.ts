import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateNoticeInput {
  @Field(() => String, { nullable: false })
  title: string

  @Field(() => String, { nullable: false })
  content: string

  @Field(() => Boolean, { nullable: false })
  isVisible: boolean

  @Field(() => Boolean, { nullable: false })
  isFixed: boolean
}

@InputType()
export class UpdateNoticeInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: false })
  title: string

  @Field(() => String, { nullable: false })
  content: string

  @Field(() => Boolean, { nullable: false })
  isVisible: boolean

  @Field(() => Boolean, { nullable: false })
  isFixed: boolean
}
