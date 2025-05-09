import { Field, InputType } from '@nestjs/graphql'
import { Language } from '@generated'

@InputType()
export class Solution {
  @Field(() => Language, { nullable: false })
  language!: keyof typeof Language

  @Field(() => String, { nullable: false })
  code!: string;

  [key: string]: string | keyof typeof Language
}
