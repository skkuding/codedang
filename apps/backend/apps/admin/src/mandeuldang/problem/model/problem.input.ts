import { Field, InputType, Int } from '@nestjs/graphql'
import { Language, Level } from '@generated'
import { UpdateProblemTagInput } from '@admin/problem/model/problem.input'
import { Solution } from '@admin/problem/model/solution.input'
import { Template } from '@admin/problem/model/template.input'

@InputType()
export class UpdateMandeuldangProblemInput {
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

  @Field(() => [Solution], { nullable: true })
  solution?: Array<Solution>

  @Field(() => Int, { nullable: true })
  timeLimit?: number

  @Field(() => Int, { nullable: true })
  memoryLimit?: number

  @Field(() => Level, { nullable: true })
  difficulty?: keyof typeof Level

  @Field(() => String, { nullable: true })
  source?: string

  @Field(() => UpdateProblemTagInput, { nullable: true })
  tags?: UpdateProblemTagInput
}
