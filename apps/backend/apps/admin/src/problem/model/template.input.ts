import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { Language } from '@generated'

@InputType('RangeInput')
@ObjectType()
export class Range {
  @Field(() => Int, { nullable: false })
  from!: number

  @Field(() => Int, { nullable: false })
  to!: number
}

@InputType('TemplateInput')
@ObjectType()
export class Template {
  @Field(() => Language, { nullable: false })
  language: keyof typeof Language

  @Field(() => String, { nullable: false })
  initialCode: string

  @Field(() => [Range], { nullable: false })
  readOnlyRanges: Range[]
}
