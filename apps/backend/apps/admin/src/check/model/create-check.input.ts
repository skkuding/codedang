import { Field, InputType, Int } from '@nestjs/graphql'
import { Language } from '@prisma/client'

@InputType()
export class CreatePlagiarismCheckInput {
  @Field(() => Language, { nullable: false })
  language: Language

  @Field(() => Boolean, { nullable: false, defaultValue: true })
  checkPreviousSubmissions: boolean

  @Field(() => Int, { nullable: false, defaultValue: 12 })
  minTokens: number

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  enableMerging: boolean

  @Field(() => Boolean, { nullable: false, defaultValue: true })
  useJplagClustering: boolean
}
