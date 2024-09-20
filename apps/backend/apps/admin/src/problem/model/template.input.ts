import { Field, InputType, Int } from '@nestjs/graphql'
import { Language } from '@generated'

@InputType()
export class Snippet {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: false })
  text!: string

  @Field(() => Boolean, { nullable: false })
  locked!: boolean
}

@InputType()
export class Template {
  @Field(() => Language, { nullable: false })
  language: keyof typeof Language

  @Field(() => [Snippet], { nullable: false })
  code: Snippet[]
}
