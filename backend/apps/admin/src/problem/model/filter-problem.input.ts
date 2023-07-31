import { Field, InputType } from '@nestjs/graphql'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'

@InputType()
export class FilterProblemsInput {
  @Field(() => [Level], { nullable: true })
  difficulty?: Array<keyof typeof Level>

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language>
}
