import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language } from '@admin/@generated'

@ObjectType()
export class SubmissionCountByLanguage {
  @Field(() => Language)
  language!: Language

  @Field(() => Int)
  count!: number
}
