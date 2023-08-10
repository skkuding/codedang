import { Field, InputType, Int } from '@nestjs/graphql'
// import { Language } from '@prisma/client'
import { LLanguage } from './problem.enum'

@InputType()
class Snippet {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: false })
  text!: string

  @Field(() => Boolean, { nullable: false })
  locked!: boolean
}

@InputType()
export class Template {
  @Field(() => LLanguage, { nullable: false })
  language: keyof typeof LLanguage

  @Field(() => [Snippet], { nullable: false })
  code: Snippet[]
}
