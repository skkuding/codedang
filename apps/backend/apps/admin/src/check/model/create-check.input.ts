import { Field, InputType, Int } from '@nestjs/graphql'
import { Language } from '@generated'

@InputType()
export class CreatePlagiarismCheckInput {
  @Field(() => Language, { nullable: false })
  language!: keyof typeof Language

  @Field(() => Int, { nullable: false, defaultValue: 12 })
  minTokens: number

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  enableMerging: boolean

  @Field(() => Boolean, { nullable: false, defaultValue: true })
  useJplagClustering: boolean
}
