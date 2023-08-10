import { Field, InputType, Int } from '@nestjs/graphql'
import { Language, Level } from '@admin/@generated'
import { Template } from './template.input'
import { Testcase } from './testcase.input'

@InputType()
export class UpdateProblemInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  inputDescription?: string

  @Field(() => String, { nullable: true })
  outputDescription?: string

  @Field(() => String, { nullable: true })
  hint?: string

  @Field(() => [Template], { nullable: true })
  template?: Array<Template>

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language>

  @Field(() => Int, { nullable: true })
  timeLimit?: number

  @Field(() => Int, { nullable: true })
  memoryLimit?: number

  @Field(() => Level, { nullable: true })
  difficulty?: keyof typeof Level

  @Field(() => String, { nullable: true })
  source?: string

  @Field(() => [String], { nullable: true })
  inputExamples?: Array<string>

  @Field(() => [String], { nullable: true })
  outputExamples?: Array<string>

  @Field(() => [Testcase], { nullable: true })
  testcases?: Array<Testcase & { id: number }>

  @Field(() => [Int], { nullable: true })
  tagIds?: Array<number>
}
