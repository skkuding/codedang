import { Field, InputType } from '@nestjs/graphql'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'

@InputType()
export class GetGroupProblemsInput {
  @Field(() => [Level], { nullable: true })
  difficulty?: Array<Level>

  @Field(() => [Language], { nullable: true })
  languages?: Array<Language>
}
