import { Field, InputType, Int, PartialType } from '@nestjs/graphql'

@InputType()
export class CreateNoticeInput {
  @Field()
  title: string

  @Field()
  content: string

  @Field()
  isVisible: boolean

  @Field()
  isFixed: boolean
}

@InputType()
export class UpdateNoticeInput extends PartialType(CreateNoticeInput) {
  @Field(() => Int)
  id: number
}
