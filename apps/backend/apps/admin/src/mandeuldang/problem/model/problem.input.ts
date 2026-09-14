import { Field, InputType, Int } from '@nestjs/graphql'
import { Language, Level, ProblemType } from '@generated'

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

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language>

  @Field(() => Int, { nullable: true })
  timeLimit?: number

  @Field(() => Int, { nullable: true })
  memoryLimit?: number

  @Field(() => Level, { nullable: true })
  difficulty?: keyof typeof Level
}

@InputType()
export class CreateMandeuldangProblemInput {
  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => ProblemType, { nullable: false })
  problemType!: ProblemType

  @Field(() => String, { nullable: true })
  description?: string | null

  @Field(() => String, { nullable: true })
  inputDescription?: string | null

  @Field(() => String, { nullable: true })
  outputDescription?: string | null

  @Field(() => Int, { nullable: true })
  timeLimit?: number | null

  @Field(() => Int, { nullable: true })
  memoryLimit?: number | null

  @Field(() => Level, { nullable: true })
  difficulty?: keyof typeof Level | null

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language> | null
}
